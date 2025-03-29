const { connect } = require("imap-simple");
const { simpleParser } = require("mailparser");
const pdfParse = require("pdf-parse");
const fs = require("fs/promises");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const config = {
  imap: {
    user: process.env.EMAIL_BOX_USER,
    password: process.env.EMAIL_BOX_PASSWORD,
    host: process.env.EMAIL_BOX_HOST,
    port: Number(process.env.EMAIL_BOX_PORT),
    tls: process.env.EMAIL_BOX_TLS === "true",
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
    connTimeout: 10000,
  },
};

async function savePdfAttachment(attachment, orderNumber) {
  try {
    const baseUploadsDir = path.join(__dirname, "../uploads");
    let subFolder = "";
    if (attachment.filename.includes("Bordereau")) {
      subFolder = "bordereaux";
    } else if (attachment.filename.includes("Formulaire-retour")) {
      subFolder = "formulaires";
    } else {
      subFolder = "autres";
    }

    const uploadsDir = path.join(baseUploadsDir, subFolder);
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(
      uploadsDir,
      `${orderNumber}-${attachment.filename}`
    );
    await fs.writeFile(filePath, attachment.content);
    return filePath;
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du PDF : ${error.message}`);
    throw error;
  }
}

// Simplifier les fonctions de logging pour ne garder que l'essentiel
function printSuccess(text) {
  console.log("✓ " + text);
}

function printError(text) {
  console.error("✖ " + text);
}

const PATTERNS = {
  VENTE: "Ton article s'est vendu !",
  EXPEDITION: "Bordereau d'envoi Vinted - à utiliser avant",
};

// Extrait le numéro de commande du nom de fichier PDF
function extractOrderNumber(filename) {
  const bordereau = filename.match(/Bordereau-Vinted-(\d+)/);
  if (bordereau) return bordereau[1];

  const formulaire = filename.match(/Formulaire-retour-commande-(\d+)/);
  if (formulaire) return formulaire[1];

  return undefined;
}

// Extrait les informations de l'acheteur depuis le contenu de l'email
function extractOrderInfo(emailContent, orderNumber) {
  if (!emailContent) return undefined;

  // Extraction du nom d'utilisateur et de l'article
  const buyerMatch = emailContent.match(/([^\s]+) a acheté\s+(.+?)\./);
  const buyerUsername = buyerMatch ? buyerMatch[1] : "";
  const itemName = buyerMatch ? buyerMatch[2] : "";

  // Extraction de l'adresse complète
  const addressMatch = emailContent.match(
    /Adresse :\s+([^]*?)(?=Adresse e-mail|$)/
  );
  const fullAddress = addressMatch ? addressMatch[1].trim() : "";

  // Extraction du pays depuis l'adresse
  const countryMatch = fullAddress.match(/(?:FR|France)$/);
  const country = countryMatch ? countryMatch[0] : "";

  // Extraction de l'email (CORRECTION ICI)
  const emailMatch = emailContent.match(/Adresse e-mail :\s+([^\s]+@[^\s]+)/);
  const buyerEmail = emailMatch ? emailMatch[1] : ""; // Correction appliquée

  if (!buyerUsername || !buyerEmail) return undefined;

  return {
    orderNumber,
    buyerUsername,
    buyerEmail,
    buyerCountry: country,
    buyerFullAddress: fullAddress,
    itemName,
    hasShippingLabel: false,
  };
}

// Extrait les informations du PDF du formulaire de retour
async function extractReturnFormInfo(attachment) {
  try {
    const buffer = attachment.content;
    const data = await pdfParse(buffer);
    const text = data.text;

    const addressMatch = text.match(
      /Adresse de retour du vendeur :\s*"([^"]+)"\s*([^\n]+)\s*(\d{5})\s+([^\n]+)\s*(France)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/s
    );
    if (!addressMatch) {
      console.error("Impossible de trouver l'adresse du vendeur");
      return undefined;
    }

    // Extraction de la date de paiement
    const dateMatch = text.match(
      /Date de paiement : (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/
    );
    if (!dateMatch) {
      console.error("Impossible de trouver la date de paiement");
      return undefined;
    }

    // Extraction des détails de la commande
    const priceSection = text.match(
      /CommandeCode de retourPrix(.*?)Codes de retour/s
    )?.[1];
    if (!priceSection) {
      console.error("Impossible de trouver la section des prix");
      return undefined;
    }

    // Extraction des articles et leurs prix
    const articles = [];
    const articleMatches = priceSection.matchAll(
      /([^€\n]+?)(?:\s*)(\d+,\d+)\s*€/g
    );
    let totalArticlesPrice = 0;
    for (const match of articleMatches) {
      const name = match[1].trim();
      // On ignore les lignes qui contiennent "Frais de port" ou "Protection acheteurs"
      if (
        !name.includes("Frais de port") &&
        !name.includes("Protection acheteurs")
      ) {
        const price = parseFloat(match[2].replace(",", "."));
        totalArticlesPrice += price;
        articles.push({ name, price });
      }
    }

    // Extraction des frais
    const shippingMatch = priceSection.match(/Frais de port\s*(\d+,\d+)\s*€/);
    const protectionMatch = priceSection.match(
      /Protection acheteurs\s*\(Pro\)\s*(\d+,\d+)\s*€/
    );
    const totalMatch = priceSection.match(/Total:\s*(\d+,\d+)\s*€/);

    if (!shippingMatch || !protectionMatch || !totalMatch) {
      console.error("Impossible de trouver tous les détails de prix");
      console.error("Texte recherché:", priceSection);
      return undefined;
    }

    const shipping = parseFloat(shippingMatch[1].replace(",", "."));
    const protection = parseFloat(protectionMatch[1].replace(",", "."));
    const total = parseFloat(totalMatch[1].replace(",", "."));

    return {
      sellerAddress: {
        name: addressMatch[1].trim(),
        address: addressMatch[2].trim(),
        postalCode: addressMatch[3].trim(),
        city: addressMatch[4].trim(),
        country: addressMatch[5].trim(),
        email: addressMatch[6].trim(),
      },
      paymentDate: dateMatch[1],
      orderDetails: {
        itemName: articles.length > 0 ? articles[0].name : "",
        itemPrice: totalArticlesPrice,
        shippingCost: shipping,
        buyerProtection: protection,
        total: total,
      },
    };
  } catch (error) {
    console.error(
      "Erreur lors de l'extraction des informations du PDF:",
      error
    );
    return undefined;
  }
}

const documentProcessingService = require("../services/documentProcessingService");

function printOrderDetails(orderNumber, orderData) {
  console.error("\n=== DÉTAILS DE LA VENTE EN ERREUR ===");
  console.error(`Numéro de commande: ${orderNumber}`);

  if (orderData.orderInfo) {
    console.error("\nInformations acheteur:");
    console.error(`- Username: ${orderData.orderInfo.buyerUsername}`);
    console.error(`- Email: ${orderData.orderInfo.buyerEmail}`);
    console.error(`- Pays: ${orderData.orderInfo.buyerCountry}`);
    console.error(
      `- Adresse complète:\n${orderData.orderInfo.buyerFullAddress}`
    );
    console.error(`- Article: ${orderData.orderInfo.itemName}`);
  }

  if (orderData.returnFormInfo) {
    console.error("\nInformations vendeur:");
    console.error(`- Nom: ${orderData.returnFormInfo.sellerAddress.name}`);
    console.error(`- Email: ${orderData.returnFormInfo.sellerAddress.email}`);
    console.error(
      `- Adresse: ${orderData.returnFormInfo.sellerAddress.address}`
    );
    console.error(
      `- Code postal: ${orderData.returnFormInfo.sellerAddress.postalCode}`
    );
    console.error(`- Ville: ${orderData.returnFormInfo.sellerAddress.city}`);

    console.error("\nDétails commande:");
    console.error(`- Date paiement: ${orderData.returnFormInfo.paymentDate}`);
    console.error(
      `- Prix article: ${orderData.returnFormInfo.orderDetails.itemPrice}€`
    );
    console.error(
      `- Frais de port: ${orderData.returnFormInfo.orderDetails.shippingCost}€`
    );
    console.error(
      `- Protection acheteur: ${orderData.returnFormInfo.orderDetails.buyerProtection}€`
    );
    console.error(`- Total: ${orderData.returnFormInfo.orderDetails.total}€`);
  }

  console.error("=======================================\n");
}

async function testEmailConnection() {
  let connection;
  try {
    connection = await connect(config);
    printSuccess("Connexion au serveur email réussie");

    await connection.openBox("INBOX");

    const date = new Date();
    date.setDate(date.getDate() - 100);
    const searchCriteria = ["ALL", ["SINCE", date]];

    const results = await connection.search(searchCriteria, {
      bodies: ["HEADER", "TEXT", ""],
      struct: true,
    });

    let processedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const orders = new Map();

    // Analyser chaque email
    for (const email of results) {
      const header = email.parts.find((p) => p.which === "HEADER");
      const subject = header?.body?.subject?.[0] || "";

      if (!subject.startsWith("Fwd:")) continue;

      const fullEmail = await simpleParser(
        email.parts.find((p) => p.which === "")?.body || ""
      );
      const attachments = fullEmail.attachments;

      if (subject.includes(PATTERNS.VENTE)) {
        if (attachments.length > 0) {
          for (const att of attachments) {
            if (att.filename) {
              const orderNumber = extractOrderNumber(att.filename);
              if (orderNumber) {
                let order = orders.get(orderNumber) || {};
                order.orderNumber = orderNumber;
                order.orderEmail = fullEmail;
                order.orderAttachments = attachments;
                orders.set(orderNumber, order);

                await savePdfAttachment(att, orderNumber);

                const orderInfo = extractOrderInfo(
                  fullEmail.text || "",
                  orderNumber
                );
                if (orderInfo) order.orderInfo = orderInfo;

                const returnFormInfo = await extractReturnFormInfo(att);
                if (returnFormInfo) {
                  order.returnFormInfo = returnFormInfo;
                  orders.set(orderNumber, order);
                }
              }
            }
          }
        }
      } else if (subject.includes(PATTERNS.EXPEDITION)) {
        if (attachments.length > 0) {
          for (const att of attachments) {
            if (att.filename) {
              const orderNumber = extractOrderNumber(att.filename);
              if (orderNumber) {
                let order = orders.get(orderNumber) || {};
                order.orderNumber = orderNumber;
                order.shippingEmail = fullEmail;
                order.shippingAttachments = attachments;
                orders.set(orderNumber, order);

                await savePdfAttachment(att, orderNumber);
              }
            }
          }
        }
      }
    }

    // Traitement final et statistiques
    for (const [orderNumber, orderData] of orders.entries()) {
      if (orderData.orderEmail && orderData.returnFormInfo) {
        try {
          console.log(
            `[EMAIL DETECTION] Starting to process order #${orderNumber}`
          );

          // Extract the seller email from returnFormInfo - this is the user email we need
          const sellerEmail = orderData.returnFormInfo.sellerAddress.email;

          if (!sellerEmail) {
            console.error(
              `[ERROR] No seller email found for order #${orderNumber}`
            );
            errorCount++;
            continue;
          }

          console.log(
            `[EMAIL DETECTION] Processing for seller: ${sellerEmail}`
          );

          // Process the order attachments with seller email
          const processedOrder =
            await documentProcessingService.processOrderDocuments(
              orderData,
              sellerEmail // Pass the seller's email instead of undefined userEmail
            );

          processedCount++;
          console.log(
            `[EMAIL DETECTION] Successfully processed order #${orderNumber}, created order ID: ${processedOrder.id}`
          );
          console.log(
            `[EMAIL DETECTION] ReturnForm ID: ${
              processedOrder.returnFormId || "none"
            }, ShippingLabel ID: ${processedOrder.shippingLabelId || "none"}`
          );
        } catch (error) {
          errorCount++;
          console.error(
            `[EMAIL DETECTION ERROR] Failed to process order #${orderNumber}: ${error.message}`
          );
          printOrderDetails(orderNumber, orderData);
        }
      } else {
        skippedCount++;
        console.log(
          `[EMAIL DETECTION] Skipping incomplete order #${orderNumber}`
        );
      }
    }

    printSuccess(
      `Traitement terminé - ${processedCount} nouvelles commandes traitées, ${skippedCount} ignorées`
    );
    if (errorCount > 0) {
      printError(`${errorCount} commandes en erreur`);
    }

    await connection.end();
    return { processedCount, errorCount, skippedCount };
  } catch (error) {
    printError(`Erreur critique: ${error.message}`);
    throw error;
  }
}

module.exports = {
  testEmailConnection,
};

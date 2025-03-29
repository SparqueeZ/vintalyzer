const puppeteer = require("puppeteer");
const filesController = require("../controllers/filesController");
const { formatDate } = require("../utils/dateFormatter");

const generateInvoiceHTML = (invoiceData) => {
  return `
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px;
        color: #333;
        font-size: 12px;
      }
      .container { 
        max-width: 800px; 
        margin: auto; 
        padding: 30px; 
        border: 1px solid #ddd;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 20px;
      }
      .logo {
        font-weight: bold;
        font-size: 24px;
        color: #2a3990;
      }
      .invoice-details {
        text-align: right;
      }
      h1 { 
        color: #2a3990;
        font-size: 24px;
        margin-bottom: 15px;
      }
      .info { 
        display: flex; 
        justify-content: space-between; 
        margin-bottom: 30px;
        margin-top: 40px;
      }
      .info-box {
        padding: 15px;
        background: #f9f9f9;
        border-radius: 5px;
        width: 45%;
      }
      .info-box h3 {
        margin-top: 0;
        color: #2a3990;
        font-size: 16px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 30px 0;
      }
      th, td { 
        padding: 12px 15px; 
        text-align: left; 
        border-bottom: 1px solid #ddd;
      }
      th { 
        background: #f5f5f5;
        font-weight: bold;
        color: #2a3990;
      }
      tr:hover {
        background-color: #f9f9f9;
      }
      .total { 
        margin-top: 30px;
        text-align: right; 
        font-size: 14px;
      }
      .final-total {
        font-size: 18px;
        font-weight: bold;
        color: #2a3990;
        margin-top: 10px;
      }
      .footer {
        margin-top: 50px;
        text-align: center;
        color: #777;
        font-size: 11px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Vintalyze</div>
        <div class="invoice-details">
          <h1>FACTURE</h1>
          <p>Numéro: ${invoiceData.invoiceNumber}</p>
          <p>Date: ${formatDate(invoiceData.issueDate)}</p>
        </div>
      </div>

      <div class="info">
        <div class="info-box">
          <h3>VENDEUR</h3>
          ${invoiceData.company.name}<br>
          ${invoiceData.company.address}<br>
          TVA: ${invoiceData.company.vatNumber}
        </div>
        
        <div class="info-box">
          <h3>CLIENT</h3>
          ${invoiceData.client.name}<br>
          ${invoiceData.client.address}<br>
          ${invoiceData.client.email}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items
            .map(
              (item) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${
                invoiceData.totalTTC.toFixed(2) - invoiceData.buyerProtection
              } €</td>
              <td>${(
                item.quantity *
                (invoiceData.totalTTC.toFixed(2) - invoiceData.buyerProtection)
              ).toFixed(2)} €</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
        <p>Total HT : ${invoiceData.totalTTC.toFixed(2)} €</p>
        <p>TVA (${invoiceData.tvaRate}%) : ${invoiceData.totalTVA.toFixed(
    2
  )} €</p>
        <p>Frais (protection acheteur) : ${invoiceData.buyerProtection} €</p>
        <p class="final-total">Total TTC : ${invoiceData.totalTTC.toFixed(
          2
        )} €</p>
      </div>

      <div class="footer">
        <p>Merci pour votre achat!</p>
        <p>Cette facture a été générée automatiquement par Vintalyze</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

exports.generateInvoicePDF = async function (invoiceData) {
  console.log("[INVOICE GENERATOR] Generating invoice PDF");
  const htmlContent = generateInvoiceHTML(invoiceData);

  try {
    // Use a proper path for puppeteer
    const puppeteerOptions = {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new", // Use new headless mode to avoid deprecation warning
    };

    console.log("[INVOICE GENERATOR] Launching puppeteer");
    const browser = await puppeteer.launch(puppeteerOptions);

    console.log("[INVOICE GENERATOR] Creating new page");
    const page = await browser.newPage();

    console.log("[INVOICE GENERATOR] Setting page content");
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    console.log("[INVOICE GENERATOR] Generating PDF");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log("[INVOICE GENERATOR] Closing browser");
    await browser.close();

    const filename = `invoice-${invoiceData.invoiceNumber}.pdf`;
    console.log(`[INVOICE GENERATOR] Uploading invoice to S3: ${filename}`);

    // Check if file already exists in S3
    try {
      await filesController.checkFileExistsInS3(filename);
      console.log(
        `[INVOICE GENERATOR] Invoice already exists in S3, using existing file`
      );
      return filesController.getS3FileUrl(filename);
    } catch (error) {
      // File doesn't exist, proceed with upload
      console.log(
        `[INVOICE GENERATOR] Invoice doesn't exist in S3, uploading new file`
      );
    }

    const fileUrl = await filesController.uploadToS3(
      pdfBuffer,
      filename,
      "application/pdf"
    );

    console.log(
      `[INVOICE GENERATOR] Invoice uploaded successfully: ${fileUrl}`
    );
    return fileUrl;
  } catch (error) {
    console.error(`[INVOICE GENERATOR] Error generating PDF: ${error}`);
    throw new Error(`Failed to generate PDF invoice: ${error.message}`);
  }
};

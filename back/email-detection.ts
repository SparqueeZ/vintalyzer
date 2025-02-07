import * as dotenv from 'dotenv';
import { connect, ImapSimpleOptions, ImapSimple } from 'imap-simple';
import { simpleParser } from 'mailparser';
import chalk from 'chalk';

dotenv.config();

const config: ImapSimpleOptions = {
    imap: {
        user: process.env.EMAIL_USER!,
        password: process.env.EMAIL_PASSWORD!,
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        tls: process.env.EMAIL_TLS === 'true',
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
        connTimeout: 10000,
    }
};

// Types pour la gestion des commandes
interface VintedOrder {
    orderNumber?: string;
    saleEmail?: any;
    shippingEmail?: any;
    saleAttachments?: any[];
    shippingAttachments?: any[];
}

interface OrderInfo {
    orderNumber: string;
    buyerUsername: string;
    buyerEmail: string;
    buyerCountry: string;
    buyerFullAddress: string;
    itemName: string;
    hasShippingLabel: boolean;
}

function printSeparator(char: string = '=', length: number = 50) {
    console.log(chalk.hex('#00ffff')(char.repeat(length)));
}

function printHeader(text: string) {
    printSeparator();
    console.log(chalk.bold.cyan(text));
    printSeparator();
}

function printSubHeader(text: string) {
    console.log('\n' + chalk.bold.yellow('▶ ' + text));
    console.log(chalk.gray('─'.repeat(50)));
}

function printSuccess(text: string) {
    console.log(chalk.green('✓ ') + text);
}

function printInfo(text: string) {
    console.log(chalk.blue('ℹ ') + text);
}

function printWarning(text: string) {
    console.log(chalk.yellow('⚠ ') + text);
}

function printError(text: string) {
    console.log(chalk.red('✖ ') + text);
}

const PATTERNS = {
    VENTE: "Ton article s'est vendu !",
    EXPEDITION: "Bordereau d'envoi Vinted - à utiliser avant"
};

// Extrait le numéro de commande du nom de fichier PDF
function extractOrderNumber(filename: string): string | undefined {
    const bordereau = filename.match(/Bordereau-Vinted-(\d+)/);
    if (bordereau) return bordereau[1];
    
    const formulaire = filename.match(/Formulaire-retour-commande-(\d+)/);
    if (formulaire) return formulaire[1];
    
    return undefined;
}

// Extrait les informations de l'acheteur depuis le contenu de l'email
function extractOrderInfo(emailContent: string, orderNumber: string): OrderInfo | undefined {
    if (!emailContent) return undefined;

    // Extraction du nom d'utilisateur et de l'article
    const buyerMatch = emailContent.match(/([^\s]+) a acheté\s+(.+?)\./);
    const buyerUsername = buyerMatch ? buyerMatch[1] : '';
    const itemName = buyerMatch ? buyerMatch[2] : '';

    // Extraction de l'adresse complète
    const addressMatch = emailContent.match(/Adresse :\s+([^]*?)(?=Adresse e-mail|$)/);
    const fullAddress = addressMatch ? addressMatch[1].trim() : '';
    
    // Extraction du pays depuis l'adresse
    const countryMatch = fullAddress.match(/(?:FR|France)$/);
    const country = countryMatch ? countryMatch[0] : '';

    // Extraction de l'email
    const emailMatch = emailContent.match(/Adresse e-mail :\s+([^\s]+@[^\s]+)/);
    const buyerEmail = emailMatch ? emailMatch[1] : '';

    if (!buyerUsername || !buyerEmail) return undefined;

    return {
        orderNumber,
        buyerUsername,
        buyerEmail,
        buyerCountry: country,
        buyerFullAddress: fullAddress,
        itemName,
        hasShippingLabel: false
    };
}

async function testEmailConnection() {
    let connection: ImapSimple | undefined;
    try {
        printHeader(' DÉMARRAGE DU TEST DE DÉTECTION EMAIL');
        printInfo('Tentative de connexion au serveur IMAP...');
        connection = await connect(config);
        printSuccess('Connexion réussie!');
        printInfo(`Compte email: ${chalk.hex('#ffff00').bold(config.imap.user)}\n`);

        // Ouvrir la boîte de réception
        await connection.openBox('INBOX');

        // Rechercher les emails des 30 derniers jours
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const searchCriteria = ['ALL', ['SINCE', date]];
        
        printHeader(' ANALYSE DES EMAILS');
        printInfo(`Période: 30 derniers jours (depuis le ${date.toLocaleDateString()})`);
        
        // On récupère les emails complets
        const results = await connection.search(searchCriteria, { bodies: ['HEADER', 'TEXT', ''], struct: true });
        printInfo(`Nombre total d'emails trouvés: ${results.length}\n`);

        let saleCount = 0;
        let shippingCount = 0;
        const orders: Map<string, VintedOrder> = new Map();

        // Analyser chaque email
        for (const email of results) {
            const header = email.parts.find(p => p.which === 'HEADER');
            const subject = header?.body?.subject?.[0] || '';

            // Ne traiter que les emails transférés
            if (!subject.startsWith('Fwd:')) {
                continue;
            }

            const fullEmail = await simpleParser(email.parts.find(p => p.which === '')?.body || '');
            const attachments = fullEmail.attachments;

            if (subject.includes(PATTERNS.VENTE)) {
                saleCount++;
                printSuccess(`Email de vente trouvé: "${subject}"`);
                
                if (attachments.length > 0) {
                    printInfo(`  └─ ${attachments.length} pièce(s) jointe(s) trouvée(s)`);
                    for (const att of attachments) {
                        if (att.filename) {
                            printInfo(`     └─ ${att.filename}`);
                            const orderNumber = extractOrderNumber(att.filename);
                            if (orderNumber) {
                                let order = orders.get(orderNumber) || {};
                                order.orderNumber = orderNumber;
                                order.saleEmail = fullEmail;
                                order.saleAttachments = attachments;
                                orders.set(orderNumber, order);

                                // Extraction des informations de l'acheteur
                                const orderInfo = extractOrderInfo(fullEmail.text || '', orderNumber);
                                if (orderInfo) {
                                    printInfo(`   └─ Acheteur: ${chalk.yellow(orderInfo.buyerUsername)}`);
                                    printInfo(`   └─ Email: ${chalk.yellow(orderInfo.buyerEmail)}`);
                                    printInfo(`   └─ Pays: ${chalk.yellow(orderInfo.buyerCountry)}`);
                                    printInfo(`   └─ Article: ${chalk.yellow(orderInfo.itemName)}`);
                                }
                            }
                        }
                    }
                }

            } else if (subject.includes(PATTERNS.EXPEDITION)) {
                shippingCount++;
                printSuccess(`Email d'expédition trouvé: "${subject}"`);
                
                if (attachments.length > 0) {
                    printInfo(`  └─ ${attachments.length} pièce(s) jointe(s) trouvée(s)`);
                    for (const att of attachments) {
                        if (att.filename) {
                            printInfo(`     └─ ${att.filename}`);
                            const orderNumber = extractOrderNumber(att.filename);
                            if (orderNumber) {
                                let order = orders.get(orderNumber) || {};
                                order.orderNumber = orderNumber;
                                order.shippingEmail = fullEmail;
                                order.shippingAttachments = attachments;
                                orders.set(orderNumber, order);
                            }
                        }
                    }
                }
            }
        }

        // Afficher le résumé des ventes
        printHeader(' RÉSUMÉ DES VENTES TROUVÉES ');
        
        let salesCount = 0;
        orders.forEach((order, number) => {
            if (order.saleEmail) {
                salesCount++;
                const info = extractOrderInfo(order.saleEmail.text || '', number);
                if (info) {
                    // Statut des PDFs
                    const returnPdfStatus = order.saleAttachments?.length ? '📄✅' : '📄❌';
                    const shippingPdfStatus = order.shippingEmail ? '📦✅' : '📦❌';
                    const matchStatus = order.saleAttachments?.length && order.shippingEmail ? '✅' : '❌';
                    
                    printSubHeader(`VENTE #${salesCount} - Commande ${number} ${matchStatus}`);
                    
                    // Documents
                    console.log(chalk.bold.white('\nDocuments trouvés:'));
                    console.log(chalk.white(`${returnPdfStatus} Formulaire de retour: `) + 
                        chalk.gray(order.saleAttachments?.[0]?.filename || 'Manquant'));
                    console.log(chalk.white(`${shippingPdfStatus} Bordereau d'expédition: `) + 
                        chalk.gray(order.shippingEmail ? 'Bordereau-Vinted-' + number + '.pdf' : 'Manquant'));

                    // Informations de vente
                    console.log(chalk.bold.white('\nInformations de vente:'));
                    console.log(chalk.white('📦 Article: ') + chalk.cyan(info.itemName));
                    console.log(chalk.white('👤 Acheteur: ') + chalk.cyan(info.buyerUsername));
                    console.log(chalk.white('📧 Email: ') + chalk.cyan(info.buyerEmail));
                    if (info.buyerCountry) {
                        console.log(chalk.white('🌍 Pays: ') + chalk.cyan(info.buyerCountry));
                    }
                    if (info.buyerFullAddress) {
                        console.log(chalk.white('📍 Adresse: ') + chalk.cyan(info.buyerFullAddress));
                    }
                    
                    console.log(''); // Ligne vide pour la séparation
                }
            }
        });

        // Statistiques globales à la fin
        printHeader(' STATISTIQUES ');
        printSuccess(`Nombre de ventes trouvées: ${chalk.white(salesCount)}`);
        const matchedOrders = Array.from(orders.values()).filter(o => o.saleEmail && o.shippingEmail).length;
        printSuccess(`Ventes avec match complet (2 PDFs): ${chalk.white(matchedOrders)}`);
        printWarning(`Ventes incomplètes: ${chalk.white(salesCount - matchedOrders)}`);

        await connection.end();
        printHeader(' TEST TERMINÉ');
    } catch (error: any) {
        printHeader(' ERREUR');
        printError(error.message);
    }
}

testEmailConnection();

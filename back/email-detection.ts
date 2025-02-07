import * as dotenv from 'dotenv';
import { connect } from 'imap-simple';
import { Config } from 'imap';
import { simpleParser } from 'mailparser';
import chalk from 'chalk';

dotenv.config();

const config: Config = {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '993'),
    tls: process.env.EMAIL_TLS === 'true',
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 3000
};

// Types pour la gestion des commandes
interface VintedOrder {
    orderNumber?: string;
    saleEmail?: any;
    shippingEmail?: any;
    saleAttachments?: any[];
    shippingAttachments?: any[];
}

function printSeparator(char: string = '=', length: number = 50) {
    console.log(chalk.hex('#00ffff')(char.repeat(length)));
}

function printHeader(text: string) {
    printSeparator();
    console.log(chalk.hex('#ffff00').bold(text));
    printSeparator();
}

function printSuccess(text: string) {
    console.log(chalk.hex('#00ff00')('✓ ' + text));
}

function printInfo(text: string) {
    console.log(chalk.hex('#0000ff')('ℹ ' + text));
}

function printWarning(text: string) {
    console.log(chalk.hex('#ffff00')('⚠ ' + text));
}

function printError(text: string) {
    console.log(chalk.hex('#ff0000')('✖ ' + text));
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

async function testEmailConnection() {
    try {
        printHeader(' DÉMARRAGE DU TEST DE DÉTECTION EMAIL');
        printInfo('Tentative de connexion au serveur IMAP...');
        const connection = await connect({imap: config});
        printSuccess('Connexion réussie!');
        printInfo(`Compte email: ${chalk.hex('#ffff00').bold(config.user)}\n`);

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

        // Afficher les statistiques
        printHeader(' STATISTIQUES GLOBALES');
        printInfo(`Total des emails analysés: ${results.length}`);
        printSuccess(`Emails de vente: ${saleCount}`);
        printSuccess(`Emails d'expédition: ${shippingCount}`);

        // Afficher les commandes trouvées
        printHeader(' COMMANDES TROUVÉES');
        if (orders.size > 0) {
            for (const [orderNumber, order] of orders) {
                const status = order.saleEmail && order.shippingEmail ? '✓' : '⚠';
                printInfo(`${status} Commande #${orderNumber}:`);
                if (order.saleEmail) {
                    printSuccess('  └─ Email de vente trouvé');
                } else {
                    printWarning('  └─ Email de vente manquant');
                }
                if (order.shippingEmail) {
                    printSuccess('  └─ Email d\'expédition trouvé');
                } else {
                    printWarning('  └─ Email d\'expédition manquant');
                }
            }
        } else {
            printWarning('Aucune commande trouvée');
        }

        await connection.end();
        printHeader(' TEST TERMINÉ');
    } catch (error: any) {
        printHeader(' ERREUR');
        printError(error.message);
    }
}

testEmailConnection();

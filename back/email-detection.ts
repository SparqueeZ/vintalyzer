import * as dotenv from 'dotenv';
import { connect } from 'imap-simple';
import { Config } from 'imap';

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

async function testEmailConnection() {
    try {
        console.log('Tentative de connexion au serveur IMAP...');
        const connection = await connect({imap: config});
        console.log('✅ Connexion réussie!');
        console.log(`Connecté en tant que: ${config.user}`);
        await connection.end();
    } catch (error: any) {
        console.error('❌ Erreur de connexion:', error.message);
    }
}

testEmailConnection();

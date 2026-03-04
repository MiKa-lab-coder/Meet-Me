/**
 * Fichier qui gere l'envoi de mails contenant les codes de verification pour les utilisateurs
 * Utilise mailpit en local pour le developpement, et nodemailer pour l'envoi de mails en production
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // Verification de l'environnement pour savoir si on est en production ou en developpement
    host: process.env.NODE_ENV === 'production' ? 'ssl0.ovh.net' : 'localhost',
    port: process.env.NODE_ENV === 'production' ? 465 : 1025,
    secure: process.env.NODE_ENV === 'production',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

interface MailData {
    to: string;
    pairingCode: string;
    magicToken: string;
}

export async function sendPairingCodeEmail({to, pairingCode, magicToken}: MailData) {
    const magicLink = `${process.env.app_URL}/api/core/pairing?pairingCode=${pairingCode}&magicToken=${magicToken}`;

    const mailOptions = {
        from: `"Meet-Me" <${process.env.MAIL_USER}>`,
        to: to,
        subject: `Accès au suivi GPS : ${pairingCode}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Invitation de suivi</h2>
                <p>Vous avez été invité à suivre un trajet en temps réel.</p>
                <p><strong>Code d'activation :</strong> ${pairingCode}</p>
                <p>Cliquez sur le lien ci-dessous pour vous connecter automatiquement :</p>
                <a href="${magicLink}" style="background: #0070f3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                    Valider l'invitation
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Ce lien expire dans 15 minutes.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return {success: true, messageId: info.messageId};
    } catch (error) {
        // En cas d'erreur, logguer l'erreur et retourner un message d'erreur générique
        console.error("Erreur SMTP : Vérifiez vos variables .env", error);
        return {success: false, error};
    }
}

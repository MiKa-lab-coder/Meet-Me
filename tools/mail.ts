/**
 * Fichier qui gere l'envoi de mails contenant les codes de verification pour les utilisateurs
 * Utilise mailpit en local pour le developpement, et nodemailer pour l'envoi de mails en production
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // Verification de l'environnement pour savoir si on est en production ou en developpement
    host: process.env.MAIL_HOST || 'ssl0.ovh.net',
    port: Number(process.env.MAIL_PORT) || 465,
    secure: process.env.MAIL_PORT === '465', // true pour 465, false pour les autres ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

interface MailData {
    to: string;
    pairingCode: string;
    magicToken: string;
}

/**
 * mail d'envoi de code de verification pour le suivi GPS
 */
export async function sendPairingCodeEmail({to, pairingCode, magicToken}: MailData) {
    const magicLink = `${process.env.APP_URL}/api/core/pairing?pairingCode=${pairingCode}&magicToken=${magicToken}`;

    const mailOptions = {
        from: `"Meet-Me" <${process.env.MAIL_USERNAME}>`,
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

/**
 * mail de recuperation de nom d'utilisateur
 */
export async function sendRevealUsernameEmail({to, username, magicToken}: {to: string, username: string, magicToken: string}) {
    const magicLink = `${process.env.APP_URL}/reveal-username?token=${magicToken}`;

    const mailOptions = {
        from: `"Meet-Me" <${process.env.MAIL_USERNAME}>`,
        to: to,
        subject: `Récupération de votre nom d'utilisateur`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Récupération de votre nom d'utilisateur</h2>
                <p>Vous avez demandé à récupérer votre nom d'utilisateur.</p>
                <p><strong>Votre nom d'utilisateur :</strong> ${username}</p>
                <p>Cliquez sur le lien ci-dessous pour vous connecter automatiquement :</p>
                <a href="${magicLink}" style="background: #0070f3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                    Valider la récupération
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Ce lien expire dans 15 minutes.
                </p>
            </div>
        `,
    };
    try{
        const info = await transporter.sendMail(mailOptions);
        return {success: true, messageId: info.messageId};
    }catch (error) {        console.error("Erreur SMTP : Vérifiez vos variables .env", error);
        return {success: false, error};
    }
}

/**
 * mail de reinitialisation de mot de passe
 */
export async function sendResetPasswordEmail({to, magicToken}: {to: string, magicToken: string}) {
    const magicLink = `${process.env.APP_URL}/reset-password?token=${magicToken}`;

    const mailOptions = {
        from: `"Meet-Me" <${process.env.MAIL_USERNAME}>`,
        to: to,
        subject: `Réinitialisation de votre mot de passe`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2>Réinitialisation de votre mot de passe</h2>
                <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour vous connecter automatiquement et réinitialiser votre mot de passe :</p>
                <a href="${magicLink}" style="background: #0070f3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                    Valider la réinitialisation
                </a>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Ce lien expire dans 15 minutes.
                </p>
            </div>
        `,
    };
    try{
        const info = await transporter.sendMail(mailOptions);
        return {success: true, messageId: info.messageId};
    }catch (error) {        console.error("Erreur SMTP : Vérifiez vos variables .env", error);
        return {success: false, error};
    }
}
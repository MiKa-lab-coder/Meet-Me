/**
 * interface qui définit la structure d'un objet de jumelage entre un utilisateur et un appareil
 *
 * @property {string} id - l'identifiant unique du jumelage (optionnel)
 * @property {string} userId - l'identifiant de l'utilisateur associé au jumelage
 * @property {string} deviceId - l'identifiant de l'appareil associé au jumelage
 * @property {Date} createdAt - la date et l'heure de création du jumelage
 * @property {Date} updatedAt - la date et l'heure de la dernière mise à jour du jumelage
 *
 * Cette interface est utilisée pour représenter les jumelages entre les utilisateurs et les appareils dans l'application,
 * permettant de suivre les associations entre eux.
 */

export interface IPairing {
    _id?: string;
    initiatorId: string;
    targetId: string;
    pairingCode: string; // Code PIN à 6 chiffres
    status: 'pending' | 'active' | 'expired'; // Types stricts
    expiresAt: string; // Date d'expiration RGPD
}
/**
 * interface qui définit la structure d'un objet utilisateur
 *
 * @property {string} id - l'identifiant unique de l'utilisateur (optionnel)
 * @property {string} username - le nom d'utilisateur de l'utilisateur
 * @property {string} email - l'adresse e-mail de l'utilisateur
 * @property {string} password - le mot de passe de l'utilisateur
 * @property {Date} createdAt - la date et l'heure de création de l'utilisateur
 * @property {Date} updatedAt - la date et l'heure de la dernière mise à jour de l'utilisateur
 *
 * Cette interface est utilisée pour représenter les données des utilisateurs dans l'application,
 * permettant de stocker et de gérer les informations des utilisateurs.
 */
export interface Iuser {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}
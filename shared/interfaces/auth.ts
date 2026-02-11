/**
 * Interface pour les données d'authentification
 *
 * @property {string} username - le nom d'utilisateur de l'utilisateur
 * @property {string} password - le mot de passe de l'utilisateur
 *
 * Cette interface est utilisée pour représenter les données d'authentification lors de la connexion d'un utilisateur,
 * permettant de stocker et de gérer les informations nécessaires pour l'authentification.
 */

export interface IAuthData {
    username: string;
    password: string;
}
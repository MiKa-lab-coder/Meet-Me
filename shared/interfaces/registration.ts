/**
 * Interface qui représente les données nécessaires pour l'inscription d'un utilisateur
 *
 * @property {string} username - le nom d'utilisateur de l'utilisateur
 * @property {string} email - l'adresse e-mail de l'utilisateur
 * @property {string} password - le mot de passe de l'utilisateur
 *
 * Cette interface est utilisée pour représenter les données d'inscription lors de la création d'un compte utilisateur,
 * permettant de stocker et de gérer les informations nécessaires pour l'inscription.
 */

export interface IRegistrationData {
    username: string;
    email: string;
    password: string;
}
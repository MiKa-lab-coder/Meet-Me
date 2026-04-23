/**
 * interface qui définit la structure d'un objet de suivi de localisation
 *
 * @property {string} id - l'identifiant unique du suivi (optionnel)
 * @property {string} userId - l'identifiant de l'utilisateur associé au suivi
 * @property {string} deviceId - l'identifiant de l'appareil associé au suivi
 * @property {number} latitude - la latitude de la position suivie
 * @property {number} longitude - la longitude de la position suivie
 * @property {Date} timestamp - la date et l'heure du suivi
 *
 * Cette interface est utilisée pour représenter les données de suivi de localisation dans l'application,
 * permettant de stocker et de gérer les informations de localisation des utilisateurs et de leurs appareils.
 */

export interface ILocation {
    lat: number;
    lng: number;
}
export interface ITracking {
    userId: string;
    location: ILocation;
    accuracy: number;
    timestamp: string; // ISO-8601 est techniquement une string en transport
}
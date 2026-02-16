/**
 * Footer de l'application Meet-Me, affiché en bas de chaque page.
 * Contient des liens vers les réseaux sociaux et des informations de contact.
 * Utilise un design simple et épuré pour s'intégrer harmonieusement avec le reste de l'application.
 */

export function Footer() {
    return (
        <footer className="bg-gray-100 text-center py-6 mt-12">
            <p className="text-sm text-meetme-blue">&copy; 2024 Meet-Me. Tous droits réservés.</p>
            <div className="mt-4">
                <a href="https://www.facebook.com/meetme" className="text-meetme-blue hover:text-gray-800 mx-2">Facebook</a>
                <a href="https://www.twitter.com/meetme" className="text-meetme-blue hover:text-gray-800 mx-2">Twitter</a>
                <a href="https://www.instagram.com/meetme" className="text-meetme-blue hover:text-gray-800 mx-2">Instagram</a>
            </div>
        </footer>
    );
}
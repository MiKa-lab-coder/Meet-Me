"use client";

import {useAuth} from "@/components/auth/authContext";
import {Navigation2, ShieldCheck} from "lucide-react";

export default function Home() {
  const {isAuthenticated} = useAuth();

  return (
      <div className="relative overflow-hidden flex flex-col gap-10 py-6 max-w-md mx-auto">
        {/* Bannière maintenance fixe en travers de la page et au-dessus du contenu */}
        <div
            className="pointer-events-none fixed left-1/2 top-1/2 z-70 w-[140vw] -translate-x-1/2 -translate-y-1/2 -rotate-22 border-y-2 border-red-600 bg-white/95 py-2 text-center"
            aria-hidden="true"
        >
          <p className="text-sm font-extrabold uppercase tracking-wide text-red-700">
            App en maintenance - fonctionnalités limitées
          </p>
        </div>

        {/* Introduction */}
        <section className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-meetme-blue tracking-tight">
            Meet-Me
          </h1>
          <p className="text-zinc-500 font-medium">
            Retrouvez-vous facilement grâce au partage de position bidirectionnel.
          </p>
        </section>

        {/* Guide d'utilisation (Le flux A <-> B) */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-800 border-b pb-2">
            Comment établir la connexion ?
          </h2>

          <div className="space-y-8 relative">
            {/* Étape 1 : Utilisateur A */}
            <div className="flex gap-4">
              <div
                  className="flex-none w-8 h-8 rounded-full bg-meetme-blue text-white flex items-center justify-center font-bold">1
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2 italic">
                  L'initiateur (Utilisateur A)
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Connectez-vous et rendez-vous dans l'onglet <strong>Meet</strong>. Entrez le pseudo de la personne que
                  vous souhaitez rejoindre pour lui envoyer une invitation.
                </p>
              </div>
            </div>

            {/* Étape 2 : Utilisateur B */}
            <div className="flex gap-4">
              <div
                  className="flex-none w-8 h-8 rounded-full bg-meetme-blue text-white flex items-center justify-center font-bold">2
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-2 italic">
                  Le partenaire (Utilisateur B)
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Votre partenaire reçoit un mail avec un <strong>code PIN</strong>. Une fois ce code validé, la
                  connexion WebSocket est établie entre vos deux appareils.
                </p>
              </div>
            </div>

            {/* Étape 3 : Le Radar */}
            <div className="flex gap-4">
              <div
                  className="flex-none w-8 h-8 rounded-full bg-meetme-green text-white flex items-center justify-center font-bold text-lg">
                <Navigation2 size={16} className="fill-current"/>
              </div>
              <div>
                <h3 className="font-bold">Échange en temps réel</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Chacun voit la position de l'autre sur la carte. La distance qui vous sépare est calculée en direct
                  pour faciliter vos retrouvailles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Note technique sur la session */}
        <section className="p-4 bg-zinc-100 rounded-2xl border border-zinc-200 flex gap-3 items-start">
          <ShieldCheck className="text-meetme-blue flex-none" size={20}/>
          <p className="text-xs text-zinc-500 leading-snug">
            Le flux de données s'arrête pour <strong>les deux utilisateurs</strong> dès que l'un d'eux met fin au
            jumelage ou ferme l'application.
          </p>
        </section>

        {/* État de connexion (Informations via le Header) */}
        {!isAuthenticated && (
            <p className="text-center text-xs text-zinc-400 font-medium italic">
              Utilisez le menu pour vous connecter et démarrer un partage.
            </p>
        )}
      </div>
  );
}

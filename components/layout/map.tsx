/**
 * Composant d'affichage de la carte avec la position de l'utilisateur et de son partenaire de jumelage.
 * Utilise la bibliothèque Leaflet pour afficher la carte et les marqueurs de position.
 * Affiche la position de l'utilisateur actuel et celle de son partenaire de jumelage (si disponible).
 * Les positions sont mises à jour en temps réel grâce au contexte global de jumelage
 * Un marqueur spécial est utilisé pour différencier la position de l'utilisateur de celle de son partenaire de jumelage.
 * La carte est centrée sur la position de l'utilisateur et s'ajuste automatiquement
 * pour inclure la position du partenaire de jumelage si elle est disponible.
 */

"use client";

import React, {useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import {useMap} from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Imports dynamiques pour éviter l'erreur "window is not defined"
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {ssr: false});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {ssr: false});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {ssr: false});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {ssr: false});

function MapBoundsUpdater({userPos, peerPos}: { userPos: [number, number] | null; peerPos: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (userPos && peerPos) {
            map.fitBounds(L.latLngBounds([userPos, peerPos]), {padding: [50, 50]});
        } else if (userPos) {
            map.setView(userPos, 15);
        }
    }, [userPos, peerPos, map]);

    return null;
}

interface MapsProps {
    userPos: [number, number] | null; // Position de l'utilisateur A (Toi)
    peerPos: [number, number] | null; // Position de l'utilisateur B (Cible)
    isPaired: boolean;               // État du jumelage (issu de ton contexte global) [cite: 2026-01-23]
}

export default function Maps({userPos, peerPos, isPaired}: MapsProps) {
    const [isClient, setIsClient] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const fallbackCenter: [number, number] = [48.8566, 2.3522];

    useEffect(() => {
        setIsClient(true);

        // Correction technique pour les icônes Leaflet qui "disparaissent" avec Next.js
        const L = require('leaflet');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Force le remontage de la carte quand userPos est disponible pour la première fois
    useEffect(() => {
        if (userPos && mapKey === 0) {
            setMapKey(1);
        }
    }, [userPos, mapKey]);

    // Affichage d'attente si la position n'est pas encore là
    if (!isClient) {
        return (
            <div
                className="h-[400px] w-full bg-gray-100 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 animate-pulse">Initialisation de la carte et du GPS...</p>
            </div>
        );
    }

    const mapCenter = userPos ?? peerPos ?? fallbackCenter;

    return (
        <div className="h-[500px] w-full rounded-xl shadow-lg overflow-hidden border-2 border-white">
            <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={15}
                scrollWheelZoom={true}
                style={{height: '100%', width: '100%'}}
            >

                <MapBoundsUpdater userPos={userPos} peerPos={peerPos} />

                {/* Couche de carte OpenStreetMap gratuite */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marqueur de l'Utilisateur A */}
                {userPos && (
                    <Marker position={userPos}>
                        <Popup>
                            <span className="font-bold">Vous</span> <br/>
                            Votre position actuelle.
                        </Popup>
                    </Marker>
                )}

                {/* Affichage conditionnel de l'Utilisateur B si le jumelage est actif */}
                {isPaired && peerPos && (
                    <Marker position={peerPos}>
                        <Popup>
                            <span className="font-bold text-blue-600">Utilisateur B</span> <br/>
                            Position partagée en temps réel.
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
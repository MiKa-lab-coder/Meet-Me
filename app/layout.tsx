import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/authContext";
import { Header } from "@/components/layout/header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetMe - Tracker de Livraison",
  description: "Partagez votre position en temps réel avec vos proches via QR code.",
  manifest: "/manifest.json",
};

// Configuration pour l'affichage mobile PWA
export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto max-w-lg px-4 py-8">
            {children}
          </main>
          <footer className="py-6 text-center text-xs text-zinc-400">
            © 2026 MeetMe - Projet Tracker Livreur
          </footer>
        </div>
      </AuthProvider>
      </body>
      </html>
  );
}

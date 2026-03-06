import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/authContext";
import { Header } from "@/components/layout/header";
import {Footer} from "@/components/layout/footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetMe - Partage de position en temps réel",
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
          <Footer />
        </div>
      </AuthProvider>
      </body>
      </html>
  );
}

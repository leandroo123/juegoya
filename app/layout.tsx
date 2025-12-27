import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://juegoya.app"),
  title: {
    default: "JuegoYa | Armá partidos de fútbol, pádel y tenis en minutos",
    template: "%s | JuegoYa",
  },
  description:
    "JuegoYa te permite crear partidos, encontrar jugadores y organizar fútbol, pádel y tenis de forma rápida y simple. Entrá con link mágico, sin contraseñas.",
  alternates: {
    canonical: "https://juegoya.app/",
  },
  openGraph: {
    title: "JuegoYa | Armá partidos de fútbol, pádel y tenis en minutos",
    description:
      "JuegoYa te permite crear partidos, encontrar jugadores y organizar fútbol, pádel y tenis de forma rápida y simple. Entrá con link mágico, sin contraseñas.",
    url: "https://juegoya.app/",
    siteName: "JuegoYa",
    type: "website",
    locale: "es_UY",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "JuegoYa - Armá partidos deportivos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuegoYa | Armá partidos de fútbol, pádel y tenis en minutos",
    description:
      "JuegoYa te permite crear partidos, encontrar jugadores y organizar fútbol, pádel y tenis de forma rápida y simple. Entrá con link mágico, sin contraseñas.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}


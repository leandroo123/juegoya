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
    default: "JuegoYa — Armá partidos de fútbol, pádel y tenis",
    template: "%s | JuegoYa",
  },
  description:
    "Creá partidos en minutos, encontrá jugadores cerca, sumate a juntadas públicas o privadas y coordiná horarios y ubicación. JuegoYa te ayuda a llenar la cancha sin vueltas.",
  alternates: {
    canonical: "https://juegoya.app/",
  },
  openGraph: {
    title: "JuegoYa — Armá partidos de fútbol, pádel y tenis",
    description:
      "Creá partidos en minutos, encontrá jugadores cerca, sumate a juntadas públicas o privadas y coordiná horarios y ubicación. JuegoYa te ayuda a llenar la cancha sin vueltas.",
    url: "https://juegoya.app/",
    siteName: "JuegoYa",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "JuegoYa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuegoYa — Armá partidos de fútbol, pádel y tenis",
    description:
      "Creá partidos en minutos, encontrá jugadores cerca, sumate a juntadas públicas o privadas y coordiná horarios y ubicación. JuegoYa te ayuda a llenar la cancha sin vueltas.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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


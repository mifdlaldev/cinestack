import type { Metadata } from "next";
import { Inter, Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CineStack — Movie Database",
    template: "%s | CineStack",
  },
  description:
    "Discover, review, and track your favorite movies. Your personal cinema companion.",
  metadataBase: new URL("https://cinestack.vercel.app"),
  keywords: ["movies", "film", "database", "reviews", "watchlist"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CineStack",
    title: "CineStack — Movie Database",
    description:
      "Discover, review, and track your favorite movies. Your personal cinema companion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineStack — Movie Database",
    description:
      "Discover, review, and track your favorite movies. Your personal cinema companion.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#0a0a0f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${archivoBlack.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./app.css";
import { ThemeProvider } from "../context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wordy – German Dictionary & Vocabulary Trainer",
    template: "%s | Wordy",
  },
  description:
    "Look up German words, browse translations, example sentences and synonyms. Save bookmarks and practise with flashcards to build vocabulary faster than with any other dictionary.",
  keywords: [
    "German dictionary",
    "Wörterbuch",
    "German translation",
    "learn German",
    "Deutsch Wörterbuch",
    "German vocabulary",
    "vocabulary trainer",
  ],
  openGraph: {
    siteName: "Wordy",
    type: "website",
    locale: "de_DE",
  },
  twitter: { card: "summary" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint to avoid flash of wrong theme */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function(){
            const s = localStorage.getItem('theme');
            const t = s === 'light' || s === 'dark' ? s
              : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}</Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

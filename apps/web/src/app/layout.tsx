import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { NotePreviewDialog } from "@/components/NotePreviewDialog";
import JsonLd from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://doxie.vercel.app'),
  title: {    default: "Doxie - Modern Rich Text Note-Taking Application",
    template: "%s | Doxie App"
  },
  description: "Take notes beautifully, organize effortlessly, collaborate seamlessly with Doxie - the modern note-taking application.",
  keywords: ["note taking", "rich text editor", "markdown editor", "collaborative notes", "document organization"],
  authors: [{ name: "Doxie Team", url: "https://doxie.vercel.app" }],  creator: "Doxie Team",
  publisher: "Doxie App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
  applicationName: "Doxie",
  generator: "Next.js",
  openGraph: {    title: "Doxie - Modern Rich Text Note-Taking Application",
    description: "Take notes beautifully, organize effortlessly, collaborate seamlessly with Doxie.",
    url: "https://doxie.vercel.app",
    siteName: "Doxie",
    images: [
      {        url: "https://doxie.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Doxie App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",    title: "Doxie - Modern Rich Text Note-Taking Application",
    description: "Take notes beautifully, organize effortlessly, collaborate seamlessly with Doxie.",
    creator: "@doxieapp",
    images: ["https://doxie.vercel.app/twitter-image.png"],
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  manifest: '/manifest.json',  alternates: {
    canonical: 'https://doxie.vercel.app',
    languages: {
      'en-US': 'https://doxie.vercel.app/en-US',
    },
  },
  category: 'productivity',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px',
              padding: '12px 20px',
            },
          }}
        />
        <AuthProvider>
          {/* Add structured data for SEO */}
          <JsonLd type="Organization" />
          <JsonLd type="WebApplication" />
          
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
          <Footer />
          <NotePreviewDialog />
        </AuthProvider>
      </body>
    </html>
  );
}

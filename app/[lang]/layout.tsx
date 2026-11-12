import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { Toaster } from "@/components/ui/toaster";
import { isLang, langStaticParams } from "@/i18n/config";

import "../globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "MobiCars",
  description: "Wynajem samochodów",
};

export function generateStaticParams() {
  return langStaticParams();
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  return (
    <html lang={lang} className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} flex min-h-full flex-col`}>
        <SiteHeader lang={lang} />
        {children}
        <SiteFooter lang={lang} />
        <PreviewBanner />
        <Toaster />
      </body>
    </html>
  );
}

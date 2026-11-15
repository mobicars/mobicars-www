import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { intlLocales, isLang, langStaticParams } from "@/i18n/config";
import { LangProvider } from "@/i18n/lang-context";
import { getMessages } from "@/i18n/messages";
import { systemCopy } from "@/i18n/system-copy";
import { clientMessages } from "@/i18n/client-messages";
import { MessagesProvider } from "@/i18n/messages-context";
import { siteOrigin } from "@/lib/fleet/seo";
import { getSiteSeo } from "@/lib/strapi";

import "../globals.css";

const poppins = Poppins({
  // No 500: `font-medium` falls back to 400. Each weight is a font file on the first visit.
  weight: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

/**
 * `viewportFit: "cover"` lets the page reach under the iPhone home bar, so the
 * fixed bottom bars can pad themselves with `env(safe-area-inset-bottom)`
 * (without it that value is always 0). `themeColor` tints the browser chrome navy.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#083052",
};

/** Site-wide defaults from the CMS (`site.seo`); a page's own SEO overrides them. */
export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const site = isLang(lang) ? lang : "pl";
  // Shared by every page: absolute URLs for social images, the site name and the language in link previews.
  const base: Metadata = {
    metadataBase: new URL(siteOrigin()),
    openGraph: { type: "website", siteName: "MobiCars", locale: intlLocales[site].replace("-", "_") },
  };
  const fallback: Metadata = { ...base, title: "MobiCars", description: getMessages(site).layout.description };
  if (!isLang(lang)) {
    return fallback;
  }
  // The CMS being down must not cost every page its title and description.
  const seo = await getSiteSeo(lang).catch(() => null);
  if (!seo) {
    return fallback;
  }
  return {
    ...base,
    title: seo.title ?? fallback.title,
    description: seo.description ?? fallback.description,
    keywords: seo.keywords ?? undefined,
    robots: { index: !seo.noIndex, follow: !seo.noFollow },
    openGraph: { ...base.openGraph, ...(seo.image ? { images: [{ url: seo.image.url, alt: seo.image.alt }] } : {}) },
  };
}

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
        <LangProvider lang={lang}>
          <MessagesProvider messages={clientMessages(lang, "base")}>
            <a
              href="#content"
              className="sr-only z-[80] rounded-control bg-blue-dark px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-none focus:ring-2 focus:ring-white"
            >
              {systemCopy(lang).skipToContent}
            </a>
            <SiteHeader lang={lang} />
            {/* The skip link's target: every page's own `<main>` sits inside. */}
            <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </div>
            <SiteFooter lang={lang} />
            <PreviewBanner />
          </MessagesProvider>
        </LangProvider>
      </body>
    </html>
  );
}

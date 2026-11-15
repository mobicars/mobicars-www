import { NextResponse, type NextRequest } from "next/server";

import { isLang } from "@/i18n/config";
import { findDocumentFile } from "@/lib/strapi";

/**
 * `/pl/dokumenty/{slug}` (and `/en/documents/{slug}`, which re-exports this):
 * a temporary redirect to the document's file in the CMS, as on the old site.
 * Contracts and e-mails link here, so the URL must keep leading to the current
 * PDF; 307, because the file changes with each new version of the document.
 * An unknown slug goes to the documents page of the language (302), the list
 * itself being a CMS page (`app/[lang]/[...slug]`).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    return new NextResponse(null, { status: 404 });
  }
  const file = await findDocumentFile(lang, slug);
  if (file) {
    return NextResponse.redirect(file, 307);
  }
  return NextResponse.redirect(new URL(lang === "pl" ? "/pl/dokumenty" : "/en/documents", request.url), 302);
}

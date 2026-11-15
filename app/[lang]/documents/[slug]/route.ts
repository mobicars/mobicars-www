import type { NextRequest } from "next/server";

import { GET as documentRedirect } from "../../dokumenty/[slug]/route";

// `/en/documents/{slug}`: the same redirect to the document's file as `/pl/dokumenty/{slug}`.
export async function GET(request: NextRequest, context: { params: Promise<{ lang: string; slug: string }> }) {
  return documentRedirect(request, context);
}

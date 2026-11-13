import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { revalidateAccess, tagsToRevalidate } from "@/lib/revalidate";

/**
 * `POST /api/revalidate`: expires cached reads so a change shows without a
 * new build. One endpoint for every source: the Strapi webhook, and manual
 * calls such as `{"tags":["rcs:catalog"]}` or `{"event":"purge"}`.
 * `Authorization: Bearer <REVALIDATE_SECRET>`. Bodies and tags: `lib/revalidate.ts`.
 */
export async function POST(request: Request) {
  const access = revalidateAccess(request);
  if (access === "not_configured") {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (access === "unauthorized") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const tags = tagsToRevalidate(body);
  if (!tags) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  for (const tag of tags) {
    // Expire now: whoever changed the data expects the next visit to show it.
    revalidateTag(tag, { expire: 0 });
  }
  return NextResponse.json({ revalidated: tags });
}

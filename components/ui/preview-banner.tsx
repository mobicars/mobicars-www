import { AlertTriangle } from "lucide-react";

import { contentPreview } from "@/lib/cache";

/** Shown while `CACHE_ENABLED` is off: live data and Strapi drafts (`lib/cache.ts`). */
export function PreviewBanner() {
  if (!contentPreview()) return null;

  return (
    // Fixed height: the phone's booking bar sits right above it (`globals.css`).
    <div
      data-preview-banner
      className="fixed bottom-0 left-0 right-0 z-50 flex h-11 items-center justify-center gap-4 overflow-hidden bg-red-500 px-4 text-xs font-normal text-white shadow-lg"
    >
      <AlertTriangle className="size-6 shrink-0 animate-pulse" />
      <div>
        <p>
          <strong>Tryb podglądu treści</strong>
        </p>
        <p className="text-xxs">
          Cache jest wyłączony. Widoczne są też nieopublikowane szkice z CMS.
        </p>
      </div>
    </div>
  );
}

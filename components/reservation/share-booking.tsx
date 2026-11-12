"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";

/**
 * Sends the booking as it stands: the URL carries every choice, so the link
 * opens the same car, dates, protection and extras. Phones (and Safari) get the
 * system share sheet (SMS, Messenger, WhatsApp…); elsewhere the link is copied.
 */
export function ShareBooking({ car, variant }: { car: string; variant: "text" | "icon" }) {
  const t = useMessages().summary;

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "MobiCars", text: fill(t.shareText, { car }), url });
      } catch {
        // Closed the share sheet; nothing to say.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.linkCopied);
    } catch {
      toast.error(t.copyFailed);
    }
  }

  return variant === "icon" ? (
    <button
      type="button"
      onClick={share}
      aria-label={t.share}
      title={t.share}
      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-blue-dark/15 text-blue-medium transition-colors duration-200 ease-out hover:border-blue-medium motion-reduce:transition-none"
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  ) : (
    <button
      type="button"
      onClick={share}
      className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-blue-medium underline-offset-2 hover:underline"
    >
      <Share2 className="size-4" aria-hidden />
      {t.share}
    </button>
  );
}

"use client";

import { useId, useState } from "react";
import { Dialog } from "react-aria-components";
import { Info } from "lucide-react";

import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";

/** "i" button that opens a dialog with an extra's description (plain text). */
export function DescriptionButton({
  title,
  description,
  tone = "dark",
}: {
  title: string;
  description: string | null;
  /** `dark`: on the blue card header. `light`: on white. */
  tone?: "dark" | "light";
}) {
  const { steps } = useMessages();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={fill(steps.detailsOf, { title })}
        onClick={() => setOpen(true)}
        className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 ${
          tone === "dark"
            ? "text-white/90 hover:bg-white/15 focus-visible:ring-white"
            : "text-blue-medium hover:bg-blue-medium/10 focus-visible:ring-blue-medium"
        }`}
      >
        <Info className="size-4" aria-hidden />
      </button>
      <WidgetModal
        open={open}
        onOpenChange={setOpen}
        className="max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(32rem,calc(100%-1.5rem))] rounded-2xl shadow-2xl"
      >
        <Dialog aria-labelledby={titleId} className="flex max-h-[inherit] min-h-0 flex-col outline-none">
          <DialogHeader titleId={titleId} title={title} className="py-4" />
          <div className="min-h-0 overflow-y-auto px-5 pb-5 text-sm leading-relaxed whitespace-pre-line text-blue-dark/85">
            {description}
          </div>
        </Dialog>
      </WidgetModal>
    </>
  );
}

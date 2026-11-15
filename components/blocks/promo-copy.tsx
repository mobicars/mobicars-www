"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "react-aria-components";

/**
 * The one client part of a promo card: copies the code and says so to screen
 * readers (`aria-live`). Sits above the card's link (`relative z-10`).
 */
export function PromoCopy({ code, label, copied }: { code: string; label: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <Button
        onPress={() => {
          void navigator.clipboard?.writeText(code).then(() => setDone(true));
        }}
        aria-label={`${label}: ${code}`}
        className="relative z-10 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-dashed border-white/60 bg-white/10 px-3 font-mono text-sm font-bold tracking-wider text-white outline-none hover:bg-white/20 data-focus-visible:ring-2 data-focus-visible:ring-white"
      >
        {code}
        {done ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {done ? copied : ""}
      </span>
    </>
  );
}

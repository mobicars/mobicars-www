import type { Messages } from "@/i18n/messages";
import type { SearchIssue } from "@/lib/reservation/search";

/** Customer-facing text for a search problem. Client code passes `useMessages()`, server code `getMessages(lang)`. */
export function issueMessage(messages: Messages, { field, code }: SearchIssue): string {
  const texts = messages.search.issues;
  switch (field) {
    case "pickup":
      if (code === "address") return texts.pickupAddress;
      if (code === "unknown") return texts.pickupUnknown;
      return texts.pickupMissing;
    case "dropoff":
      if (code === "address") return texts.dropoffAddress;
      if (code === "unknown") return texts.dropoffUnknown;
      return texts.dropoffMissing;
    case "start":
      if (code === "past") return texts.startPast;
      return texts.startMissing;
    case "end":
      if (code === "beforeStart") return texts.endBeforeStart;
      return texts.endMissing;
    case "months":
      return texts.monthsMissing;
    case "km":
      return texts.kmMissing;
  }
}

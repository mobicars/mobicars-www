import type { SearchIssue } from "@/lib/reservation/search";

/** Customer-facing text for a search problem. Polish only, like the rest of the widget. */
export function issueMessage({ field, code }: SearchIssue): string {
  switch (field) {
    case "pickup":
      if (code === "address") return "Podaj adres, pod który podstawimy auto.";
      if (code === "unknown") return "Wybrane miejsce odbioru jest niedostępne. Wybierz inne.";
      return "Wybierz miejsce odbioru.";
    case "dropoff":
      if (code === "address") return "Podaj adres, spod którego odbierzemy auto.";
      if (code === "unknown") return "Wybrane miejsce zwrotu jest niedostępne. Wybierz inne.";
      return "Wybierz miejsce zwrotu lub zwróć auto w miejscu odbioru.";
    case "start":
      if (code === "past") return "Ten termin odbioru jest już niedostępny. Wybierz późniejszy.";
      return "Wybierz datę i godzinę odbioru.";
    case "end":
      if (code === "beforeStart") return "Zwrot musi nastąpić po odbiorze.";
      return "Wybierz datę i godzinę zwrotu.";
    case "months":
      return "Wybierz liczbę miesięcy.";
    case "km":
      return "Wybierz limit kilometrów.";
  }
}

/**
 * Car page slugs: the car name and the RentCarSoft offer id, `toyota-yaris-1219`.
 * Same shape as the old site's (`slugify("Toyota Yaris 1219")`), so its indexed
 * URLs keep working. The id at the end is what the page reads; the name part
 * is only for people and search engines, and a stale one redirects to the
 * current slug. The id stays because names repeat (two "Renault Trafic").
 */

/** Letters that NFKD does not split into a base letter and a mark. */
const SPECIAL: Record<string, string> = { ł: "l", Ł: "l", ß: "ss", æ: "ae", ø: "o", đ: "d" };

export function carSlug(name: string, id: number): string {
  const words = name
    .replace(/[łŁßæøđ]/g, (letter) => SPECIAL[letter])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return words ? `${words}-${id}` : String(id);
}

/** The offer id at the end of a slug, or `null` when there is none. */
export function offerIdFromSlug(slug: string): number | null {
  const match = /(?:^|-)(\d+)$/.exec(slug);
  if (!match) {
    return null;
  }
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

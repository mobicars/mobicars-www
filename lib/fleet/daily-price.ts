import type { OfferPriceBand } from "@/lib/rentcarsoft";

/**
 * The daily "from" price, by the client's rule: the real lowest price a car
 * can be booked for, always shown with its condition. Daily prices belong to
 * the price class (`segmentId`): its bands fall with the rental length, so the
 * minimum is the 30+ day band (89 zł for Klasa A on 13 November 2026), and the
 * card adds the 1-day price (179 zł). `redesign/rcs-analysis.md` §1.
 *
 * A promotional band price counts only between the promotion's start and end
 * (`promocja_od`, `promocja_do`, Warsaw time). Prices are gross PLN, as the API
 * gives them. Pure functions: `cars.ts` passes the time.
 */
export type DailyFrom = {
  /** Lowest price per day over every band. */
  price: number;
  /** Shortest rental, in days, that gets `price` ("przy najmie od 30 dni"). */
  fromDays: number;
  /** Price per day for a one-day rental; `null` when the class has no such band. */
  oneDay: number | null;
  /** `price` is a promotional price running now. */
  promotional: boolean;
};

export type PromotionWindow = { startsAt: string | null; endsAt: string | null };

/** RentCarSoft date-time (`2026-12-15 23:55:00`, Warsaw wall time) as epoch milliseconds. */
export function warsawTime(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (!match) {
    return null;
  }
  const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return asUtc - warsawOffset(asUtc);
}

/** Warsaw's UTC offset in milliseconds at about that moment (CET or CEST). */
function warsawOffset(epoch: number): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", timeZoneName: "shortOffset" })
    .formatToParts(new Date(epoch))
    .find((part) => part.type === "timeZoneName")?.value;
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name ?? "");
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return (match[1] === "-" ? -1 : 1) * minutes * 60_000;
}

/** A promotion with no start runs from always; with no end, until RentCarSoft drops it. */
export function promotionActive(promotion: PromotionWindow | null, now: number): boolean {
  if (!promotion) {
    return false;
  }
  const start = promotion.startsAt ? warsawTime(promotion.startsAt) : null;
  const end = promotion.endsAt ? warsawTime(promotion.endsAt) : null;
  return (start === null || start <= now) && (end === null || now <= end);
}

/**
 * The next moment a promotion starts or ends, so a cached price never
 * outlives it (`cars.ts` sets the cache lifetime from it). `null` when none.
 */
export function nextPriceChange(promotions: (PromotionWindow | null)[], now: number): number | null {
  let next: number | null = null;
  for (const promotion of promotions) {
    for (const value of [promotion?.startsAt, promotion?.endsAt]) {
      const time = value ? warsawTime(value) : null;
      if (time !== null && time > now && (next === null || time < next)) {
        next = time;
      }
    }
  }
  return next;
}

/** The bands as a customer can book them now: a promotional price only while its promotion runs. */
export function bandsAt(bands: OfferPriceBand[], promotion: PromotionWindow | null, now: number): OfferPriceBand[] {
  const active = promotionActive(promotion, now);
  return bands.map((band) => (active ? band : { ...band, promotionalPrice: null }));
}

export function dailyFrom(bands: OfferPriceBand[]): DailyFrom | null {
  let best: DailyFrom | null = null;
  let oneDay: number | null = null;
  for (const band of bands) {
    const price = band.promotionalPrice ?? band.price;
    if (price === null || price <= 0) {
      continue;
    }
    const fromDays = band.from ?? 1;
    if (fromDays <= 1) {
      oneDay = price;
    }
    if (!best || price < best.price || (price === best.price && fromDays < best.fromDays)) {
      best = { price, fromDays, oneDay: null, promotional: band.promotionalPrice !== null };
    }
  }
  return best ? { ...best, oneDay } : null;
}

export type ClassPrice = DailyFrom & { segmentId: string; segment: string; cars: number };

/**
 * The daily "from" price per price class and the lowest of them, from the
 * fleet cards. Only cars that can be booked count (`rentable`, rented by the
 * day); a class with none of them has no price.
 */
export function classPricesFrom<
  Car extends { segmentId: string | null; segment: string; rentable: boolean; shortTerm: boolean; daily: DailyFrom | null },
>(cars: Car[]): { classes: ClassPrice[]; lowest: ClassPrice | null } {
  const classes = new Map<string, ClassPrice>();
  for (const car of cars) {
    if (!car.rentable || !car.shortTerm || !car.segmentId || !car.daily) {
      continue;
    }
    const current = classes.get(car.segmentId);
    // Every car of a class shares its price list; the count is what differs.
    classes.set(car.segmentId, current ? { ...current, cars: current.cars + 1 } : { ...car.daily, segmentId: car.segmentId, segment: car.segment, cars: 1 });
  }
  const list = [...classes.values()];
  const lowest = list.reduce<ClassPrice | null>((min, each) => (!min || each.price < min.price ? each : min), null);
  return { classes: list, lowest };
}

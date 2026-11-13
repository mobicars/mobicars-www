"use client";

import { BadgePercent, Fuel, Settings2, Square, SquareCheck, Users, type LucideIcon } from "lucide-react";

import Image from "next/image";
import type { ReactNode } from "react";

import { formatDateTime } from "@/components/account/format";
import { formatDayCount, formatMoney } from "@/components/reservation/format";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { plural } from "@/i18n/plural";
import type { OfferCard } from "@/lib/reservation/offers";
import type { ReservationTerm } from "@/lib/reservation/search";

/** Pieces shared by the car tile (monthly grid) and the segment row (daily list). */

/** Seats, gearbox and fuel in one row: icons carry the meaning, so seats is just the number. */
export function SpecList({ offer, className = "" }: { offer: OfferCard; className?: string }) {
  const lang = useLang();
  const { cars } = useMessages();
  // `seats` is the API's text; a non-number still gets the general form.
  const seats = offer.seats ? `${offer.seats} ${plural(lang, Number(offer.seats), cars.seats)}` : undefined;
  return (
    <ul className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-dark/80 ${className}`}>
      <Spec icon={Users} value={offer.seats} label={seats} />
      <Spec icon={Settings2} value={offer.transmission} />
      <Spec icon={Fuel} value={offer.fuelType} />
    </ul>
  );
}

/** Choose / chosen, with an empty or a ticked square. */
export function ChooseButton({
  selected,
  onClick,
  className = "",
  describedBy,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  /** Id of what is chosen (e.g. the package's heading), so "Wybierz" says what it picks. */
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-describedby={describedBy}
      onClick={onClick}
      className={`${chooseClass(selected)} ${className}`}
    >
      <ChooseFace selected={selected} />
    </button>
  );
}

/** The look of `ChooseButton`, for a control that is not a button (the zone radios). */
export function chooseClass(selected: boolean): string {
  return `flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white transition-colors duration-200 ease-out motion-reduce:transition-none ${
    selected ? "bg-green-medium hover:bg-green-dark" : "bg-blue-medium hover:bg-blue-dark"
  }`;
}

export function ChooseFace({ selected }: { selected: boolean }) {
  const { cars } = useMessages();
  return (
    <>
      {selected ? <SquareCheck className="size-4" aria-hidden /> : <Square className="size-4" aria-hidden />}
      {selected ? cars.chosen : cars.choose}
    </>
  );
}

function Spec({ icon: Icon, value, label }: { icon: LucideIcon; value: string | null; label?: string }) {
  if (!value) {
    return null;
  }
  return (
    <li className="flex min-w-0 items-center gap-1">
      <Icon className="size-4 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
      {/* A bare "4" next to the people icon; screen readers still hear "4 seats". */}
      {label ? (
        <>
          <span aria-hidden>{value}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span className="min-w-0 break-words">{value}</span>
      )}
    </li>
  );
}

/** VAT rate used to show the net monthly price, as on the old site. */
const VAT = 1.23;

export function Price({ offer, term }: { offer: OfferCard; term: ReservationTerm }) {
  const lang = useLang();
  const { cars } = useMessages();
  // Only a real deposit is worth a line; "Bez kaucji" was noise.
  const deposit = offer.deposit ? (
    <p className="text-xxs text-muted-dark">{fill(cars.deposit, { amount: formatMoney(lang, offer.deposit) })}</p>
  ) : null;
  if (term === "long") {
    if (offer.monthlyPrice === null) {
      return <p className="text-xs text-muted-dark">{cars.priceLater}</p>;
    }
    return (
      <div className="min-w-0">
        <p className="text-xl font-bold text-blue-dark">
          {formatMoney(lang, offer.monthlyPrice)}
          <span className="text-xs font-semibold"> {cars.perMonth}</span>
        </p>
        <p className="text-xxs text-muted-dark">{fill(cars.net, { amount: formatMoney(lang, offer.monthlyPrice / VAT) })}</p>
        {deposit}
      </div>
    );
  }
  if (offer.totalPrice === null) {
    return <p className="text-xs text-muted-dark">{cars.priceLater}</p>;
  }
  return (
    <div className="min-w-0">
      {offer.regularTotalPrice !== null ? (
        <p className="text-xs text-muted-dark">
          <span className="sr-only">{cars.regularPrice} </span>
          <s>{formatMoney(lang, offer.regularTotalPrice)}</s>
        </p>
      ) : null}
      <p className={`text-xl font-bold whitespace-nowrap ${offer.promotion ? "text-green-medium" : "text-blue-dark"}`}>
        {offer.promotion ? <span className="sr-only">{cars.promoPrice} </span> : null}
        {formatMoney(lang, offer.totalPrice)}
        <DaysSuffix days={offer.days} />
      </p>
      {deposit}
    </div>
  );
}

/** " / 2 dni" after a total: the price is for the whole rental. */
function DaysSuffix({ days }: { days: number | null }) {
  const lang = useLang();
  return days ? <span className="text-xs font-semibold text-muted-dark"> / {formatDayCount(lang, days)}</span> : null;
}

/**
 * The promotion on its own row right above the price, after a divider, in
 * every car view (above, so price and button line up across cards): a green icon, the name and when it ends, no background. The
 * old site said "Cena obowiązuje przy odbiorze auta do 2026-12-17 20:00:00";
 * this reads "Jesień z Mobicars do 15 gru 2026, 23:55".
 */
export function PromotionLine({
  offer,
  divider = true,
  className = "",
}: {
  offer: OfferCard;
  /** Line above it; off where the container already draws one. */
  divider?: boolean;
  className?: string;
}) {
  const lang = useLang();
  const { cars } = useMessages();
  if (!offer.promotion) {
    return null;
  }
  const endsAt = formatDateTime(lang, offer.promotion.endsAt);
  return (
    <p
      className={`flex items-start gap-1.5 text-xs leading-snug text-blue-dark ${
        divider ? "border-t border-muted-light pt-3" : ""
      } ${className}`}
    >
      <BadgePercent className="mt-px size-4 shrink-0 text-green-medium" aria-hidden />
      <span className="min-w-0">
        <span className="block font-bold">{offer.promotion.name ?? cars.promotion}</span>
        {/* Its own line and never split, so "do 18 gru 2026, 20:00" is read in one piece. */}
        {endsAt ? (
          <span className="block whitespace-nowrap text-muted-dark">
            <span className="sr-only">{cars.promotionValid} </span>
            {fill(cars.promotionUntil, { date: endsAt })}
          </span>
        ) : null}
      </span>
    </p>
  );
}

/** The price a card leads with: the whole rental by the day, or one month. */
export function priceOf(offer: OfferCard, term: ReservationTerm): number | null {
  return term === "long" ? offer.monthlyPrice : offer.totalPrice;
}


/**
 * Phone layout of a car or class: photo on the left, name and key specs on the
 * right, price and "Wybierz" in one row below. About 170px tall, so a phone
 * shows four or five at once instead of one.
 */
export function CompactOfferCard({
  offer,
  term,
  title,
  subtitle,
  selected,
  highlighted = selected,
  onChoose,
  preload = false,
  children,
}: {
  offer: OfferCard;
  term: ReservationTerm;
  title: string;
  subtitle: ReactNode;
  selected: boolean;
  /** Green frame: the chosen car is in this card (a class may preview another one). */
  highlighted?: boolean;
  onChoose: () => void;
  /** The first card of the list: its photo is the page's largest paint. */
  preload?: boolean;
  /** Extra row, e.g. the other cars of a class. */
  children?: ReactNode;
}) {
  const lang = useLang();
  const { cars } = useMessages();
  const price = priceOf(offer, term);
  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border-2 bg-white p-3 transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none ${
        highlighted ? "border-green-medium shadow-lg" : "border-transparent shadow-sm"
      }`}
    >
      <div className="flex gap-3">
        <span className="relative block h-20 w-32 shrink-0">
          {offer.image ? (
            <Image src={offer.image.src} alt="" fill sizes="128px" preload={preload} className="object-contain" />
          ) : null}
          {offer.popular ? (
            <span className="absolute -top-1 -left-1 rounded-full bg-green-light px-2 py-0.5 text-xxs font-bold text-green-dark">
              {cars.popular}
            </span>
          ) : null}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="font-semibold leading-snug text-blue-dark">{title}</h3>
          <p className="text-xs text-muted-dark">{subtitle}</p>
        </div>
      </div>
      {/* Full width under photo and name, so seats, gearbox and fuel fit one line. */}
      <SpecList offer={offer} />
      {children}
      {/* Above the price, so price and button stay the card's last row. */}
      {term === "short" ? <PromotionLine offer={offer} /> : null}
      <div className="flex items-center justify-between gap-3 border-t border-muted-light pt-3">
        {price === null ? (
          <p className="text-xs text-muted-dark">{cars.priceLater}</p>
        ) : (
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className="flex flex-wrap items-baseline gap-x-2">
              {term === "short" && offer.regularTotalPrice !== null ? (
                <s className="text-xxs text-muted-dark">
                  <span className="sr-only">{cars.regularPrice} </span>
                  {formatMoney(lang, offer.regularTotalPrice)}
                </s>
              ) : null}
              <span className={`text-lg font-bold whitespace-nowrap ${term === "short" && offer.promotion ? "text-green-medium" : "text-blue-dark"}`}>
                {formatMoney(lang, price)}
                {term === "long" ? <span className="text-xs font-semibold"> {cars.perMonth}</span> : <DaysSuffix days={offer.days} />}
              </span>
            </p>
            {offer.deposit ? <p className="text-xxs text-muted-dark">{fill(cars.deposit, { amount: formatMoney(lang, offer.deposit) })}</p> : null}
          </div>
        )}
        <ChooseButton selected={selected} onClick={onChoose} />
      </div>
    </article>
  );
}

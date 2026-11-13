"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fuel, LoaderCircle, Settings2, Users } from "lucide-react";

import { ConfirmQuestion } from "@/components/reservation/dialog-parts";
import { formatMoney } from "@/components/reservation/format";
import { ChooseButton } from "@/components/reservation/offer-parts";
import { Slider } from "@/components/reservation/slider";
import { currentHrefWith } from "@/components/reservation/url";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import { plural } from "@/i18n/plural";
import { QUERY_KEYS } from "@/lib/reservation/search";
import type { UpsellOption } from "@/lib/reservation/upsell";

/**
 * "Potrzebujesz większego komfortu?": dearer classes next to the chosen car
 * (rules in `lib/reservation/upsell.ts`). Picking one asks first; then the
 * car changes and the page checks protection and extras for the new class.
 */
export function Upsell({ options }: { options: UpsellOption[] }) {
  const router = useRouter();
  const t = useMessages().upsell;
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<UpsellOption | null>(null);

  if (options.length === 0) {
    return null;
  }

  function switchCar(option: UpsellOption) {
    setConfirm(null);
    startTransition(() => router.push(currentHrefWith({ [QUERY_KEYS.offer]: String(option.car.id) }), { scroll: false }));
  }

  return (
    <section aria-labelledby="upsell-title" aria-busy={pending}>
      <div className="mb-3 flex items-center gap-2">
        <h3 id="upsell-title" className="text-lg font-semibold text-blue-dark">
          {t.title}
        </h3>
        {pending ? (
          <span role="status" className="flex items-center gap-1 text-xs text-muted-dark">
            <LoaderCircle className="size-4 animate-spin text-blue-medium motion-reduce:animate-none" aria-hidden />
            {t.switching}
          </span>
        ) : null}
      </div>
      {/* Phones: a swipe row. Wider: two per row; a single suggestion takes the whole width as a larger card. */}
      {options.length > 1 ? (
        <Slider
          label={t.cars}
          className="-mx-3 scroll-px-3 px-3 pb-1 @xl:mx-0 @xl:grid @xl:grid-cols-2 @xl:gap-4 @xl:overflow-visible @xl:px-0"
          itemClassName="w-[85%] @xl:w-auto"
          dotsClassName="@xl:hidden"
        >
          {options.map((option) => (
            <UpsellCard
              key={option.car.id}
              option={option}
              wide={false}
              disabled={pending}
              onChoose={() => setConfirm(option)}
            />
          ))}
        </Slider>
      ) : (
        <UpsellCard option={options[0]} wide disabled={pending} onChoose={() => setConfirm(options[0])} />
      )}
      <ConfirmQuestion
        open={confirm !== null}
        title={t.confirmTitle}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && switchCar(confirm)}
      />
    </section>
  );
}

function UpsellCard({
  option,
  wide,
  disabled,
  onChoose,
}: {
  option: UpsellOption;
  /** The only suggestion: photo on the left, details on the right, full width. */
  wide: boolean;
  disabled: boolean;
  onChoose: () => void;
}) {
  const t = useMessages().upsell;
  const lang = useLang();
  const { car } = option;
  const photo = car.image ? (
    <span className={`relative block w-full ${wide ? "h-44 @xl:h-auto @xl:min-h-48 @xl:w-1/2 @xl:shrink-0" : "my-3 h-28"}`}>
      <Image
        src={car.image.src}
        alt=""
        fill
        sizes={wide ? "(min-width: 1280px) 440px, 90vw" : "(min-width: 1280px) 420px, 90vw"}
        className="object-contain"
      />
    </span>
  ) : null;

  return (
    <article
      // Hover darkens the frame, like the extras, zone and protection cards.
      className={`relative flex w-full rounded-2xl border-2 border-transparent bg-white p-4 shadow-sm transition-colors duration-200 ease-out hover:border-blue-medium/40 motion-reduce:transition-none ${
        wide ? "flex-col gap-4 @xl:flex-row @xl:items-center @xl:p-6" : "flex-col"
      }`}
    >
      {wide ? photo : null}
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className={`font-semibold text-blue-dark ${wide ? "text-xl" : ""}`}>{car.name}</h4>
          <p className="text-xs text-muted-dark">{fill(t.orSimilar, { segment: car.segment })}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className={`block font-bold text-green-medium ${wide ? "text-2xl" : "text-lg"}`}>
            +{formatMoney(lang, option.increase)}
          </span>
          <span className="block text-xxs text-muted-dark">{option.unit === "month" ? t.perMonth : t.perDay}</span>
        </p>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-dark/80">
        {car.transmission ? (
          <li className="flex items-center gap-1">
            <Settings2 className="size-3.5 text-blue-medium" strokeWidth={1.75} aria-hidden />
            {car.transmission}
          </li>
        ) : null}
        {car.fuelType ? (
          <li className="flex items-center gap-1">
            <Fuel className="size-3.5 text-blue-medium" strokeWidth={1.75} aria-hidden />
            {car.fuelType}
          </li>
        ) : null}
        {car.seats ? (
          <li className="flex items-center gap-1">
            <Users className="size-3.5 text-blue-medium" strokeWidth={1.75} aria-hidden />
            {car.seats} {plural(lang, Number(car.seats), t.seats)}
          </li>
        ) : null}
      </ul>
      {wide ? null : photo}
      <p className={`mt-auto text-xxs text-muted-dark ${wide ? "pt-4" : ""}`}>
        {fill(t.wholeRental, { price: formatMoney(lang, option.totalIncrease) })}
      </p>
      {/* The card-wide click area comes from the button's ::after. */}
      <span className={disabled ? "pointer-events-none opacity-60" : undefined}>
        <ChooseButton
          selected={false}
          onClick={onChoose}
          className="mt-2 w-full after:absolute after:inset-0 after:rounded-2xl"
        />
      </span>
      </div>
    </article>
  );
}

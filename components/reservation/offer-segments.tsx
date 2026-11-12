"use client";

import { useState } from "react";
import Image from "next/image";

import { ChooseButton, CompactOfferCard, Price, PromotionLine, SpecList } from "@/components/reservation/offer-parts";
import { ScrollRow } from "@/components/reservation/scroll-row";
import { fill } from "@/i18n/fill";
import { useMessages } from "@/i18n/messages-context";
import type { OfferCard } from "@/lib/reservation/offers";

/**
 * Daily rental list grouped by price segment, like the old `/rezerwacja`.
 * A customer books a class ("Skoda Fabia or similar"), and every car in a
 * segment has the same price, so one row shows one segment: a large photo of
 * the car being previewed, thumbnails of the other cars in the class, and the
 * class price.
 */

export type OfferSegment = {
  key: string;
  name: string;
  offers: OfferCard[];
};

/** Groups offers by segment, keeping the order in which segments first appear. */
export function groupBySegment(offers: OfferCard[]): OfferSegment[] {
  const groups = new Map<string, OfferSegment>();
  for (const offer of offers) {
    const key = offer.segmentId ?? offer.segment;
    const group = groups.get(key);
    if (group) {
      group.offers.push(offer);
    } else {
      groups.set(key, { key, name: offer.segment, offers: [offer] });
    }
  }
  return [...groups.values()];
}

export function SegmentRow({
  segment,
  selectedId,
  onChoose,
  onSwap,
  preload = false,
}: {
  segment: OfferSegment;
  selectedId: number | null;
  onChoose: (id: number) => void;
  /** The class already holds the chosen car: a thumbnail makes another car of it the choice, in place. */
  onSwap: (id: number) => void;
  /** The first row of the list: its photo is the page's largest paint. */
  preload?: boolean;
}) {
  const { cars } = useMessages();
  const chosenHere = segment.offers.find((offer) => offer.id === selectedId);
  const [previewId, setPreviewId] = useState(
    () => (chosenHere ?? segment.offers[0]).id,
  );
  // A filter can drop the previewed car; fall back to the first one left.
  const preview = segment.offers.find((offer) => offer.id === previewId) ?? segment.offers[0];
  const selected = preview.id === selectedId;
  const titleId = `segment-${segment.key}`;

  function pick(id: number) {
    setPreviewId(id);
    // Only in the class that holds the choice; elsewhere a thumbnail just previews.
    if (chosenHere && id !== chosenHere.id) {
      onSwap(id);
    }
  }

  return (
    <>
    {/* Narrow column (phones): one compact card; the other cars of the class as a thumbnail row. */}
    <div className="@xl:hidden">
      <CompactOfferCard
        offer={preview}
        term="short"
        title={segment.name}
        subtitle={
          <>
            <span className="font-semibold text-blue-dark">{preview.name}</span> {cars.orSimilar}
          </>
        }
        selected={selected}
        highlighted={chosenHere !== undefined}
        onChoose={() => onChoose(preview.id)}
        preload={preload}
      >
        {segment.offers.length > 1 ? (
          <ScrollRow label={fill(cars.carsInClass, { name: segment.name })}>
            {segment.offers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                aria-pressed={offer.id === preview.id}
                onClick={() => pick(offer.id)}
                // Green for the chosen car, blue for a car only previewed.
                className={`flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border-2 bg-white pr-3 pl-1 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                  offer.id === selectedId
                    ? "border-green-medium"
                    : "border-muted-light aria-pressed:border-blue-medium"
                }`}
              >
                <span className="relative block h-8 w-14 shrink-0">
                  {offer.image ? (
                    <Image src={offer.image.src} alt="" fill sizes="56px" className="object-contain" />
                  ) : null}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap text-blue-dark">{offer.name}</span>
              </button>
            ))}
          </ScrollRow>
        ) : null}
      </CompactOfferCard>
    </div>
    <article
      aria-labelledby={titleId}
      className={`hidden grid-cols-1 overflow-hidden @xl:grid rounded-2xl border-2 bg-white transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none @xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @3xl:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] ${
        chosenHere ? "border-green-medium shadow-lg" : "border-transparent shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative aspect-[16/10] bg-white @xl:aspect-auto @xl:min-h-56">
        {preview.image ? (
          <Image
            key={preview.id}
            src={preview.image.src}
            alt={preview.image.alt}
            fill
            // About a third of the list column next to the 20rem summary panel.
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 280px, 340px"
            preload={preload}
            className="object-contain p-4"
          />
        ) : null}
        {preview.popular ? (
          <span className="absolute top-3 left-3 rounded-full bg-green-light px-2.5 py-1 text-xxs font-bold text-green-dark">
            {cars.popular}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-4 @xl:p-5">
        <div>
          <h3 id={titleId} className="text-xl font-semibold text-blue-dark">
            {segment.name}
          </h3>
          <p className="text-sm text-muted-dark">
            <span className="font-semibold text-blue-dark">{preview.name}</span> {cars.orSimilar}
          </p>
        </div>
        <SpecList offer={preview} />
        {segment.offers.length > 1 ? (
          <div role="group" aria-label={fill(cars.carsInClass, { name: segment.name })} className="mt-auto flex flex-wrap gap-2">
            {segment.offers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                aria-pressed={offer.id === preview.id}
                onClick={() => pick(offer.id)}
                // Green for the chosen car, blue for a car only previewed.
                className={`flex w-28 cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-colors duration-200 ease-out motion-reduce:transition-none ${
                  offer.id === selectedId
                    ? "border-green-medium"
                    : "border-muted-light hover:border-blue-medium/40 aria-pressed:border-blue-medium"
                }`}
              >
                <span className="relative block aspect-[16/10] w-full bg-white">
                  {offer.image ? (
                    <Image src={offer.image.src} alt="" fill sizes="112px" className="object-contain p-1" />
                  ) : null}
                </span>
                <span className="px-2 py-1.5 text-xxs font-semibold text-blue-dark">
                  {offer.name}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-row flex-wrap items-end justify-between gap-3 border-t border-muted-light p-4 @xl:col-span-2 @xl:p-5 @3xl:col-span-1 @3xl:flex-col @3xl:items-stretch @3xl:justify-center @3xl:border-t-0 @3xl:border-l">
        {/* First, full width: price and button follow on their own row. The column has its own border. */}
        <PromotionLine offer={preview} divider={false} className="w-full" />
        <Price offer={preview} term="short" />
        <ChooseButton
          selected={selected}
          onClick={() => onChoose(preview.id)}
          className="@3xl:w-full"
        />
      </div>
    </article>
    </>
  );
}

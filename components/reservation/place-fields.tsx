"use client";

import {
  lazy,
  Suspense,
  useState,
  type Ref,
} from "react";
import {
  MapPin,
  MapPinCheck,
  MapPinMinus,
  Square,
  X,
} from "lucide-react";

import { BarField, fieldHover, invalidField } from "@/components/reservation/bar-field";
import { DialogLoading, useIdlePreload } from "@/components/reservation/lazy-dialog";
import type { PlaceDialogKind } from "@/components/reservation/place-dialog-body";
import { WidgetModal } from "@/components/reservation/dialog-parts";
import { useMessages } from "@/i18n/messages-context";
import type { PickupPlace } from "@/lib/reservation/places";
import type { PlaceRef, SearchDraft } from "@/lib/reservation/search";

type PlaceField = "pickup" | "dropoff";

const loadPlaceDialog = () => import("@/components/reservation/place-dialog-body");
/** The dialog's content is loaded on the first open (or when the browser is idle), not with the page. */
const PlaceDialogBody = lazy(() => loadPlaceDialog().then((module) => ({ default: module.PlaceDialogBody })));

type ChosenPlace = {
  place: PickupPlace;
  ownAddress: string | null;
};

export type PlaceFieldsValue = Pick<SearchDraft, "pickup" | "differentReturn" | "dropoff">;

export function PlaceFields({
  places,
  value,
  onChange,
  invalid,
  pickupRef,
  dropoffRef,
}: {
  places: PickupPlace[];
  value: PlaceFieldsValue;
  onChange: (patch: Partial<PlaceFieldsValue>) => void;
  invalid: { pickup: boolean; dropoff: boolean };
  pickupRef?: Ref<HTMLButtonElement>;
  dropoffRef?: Ref<HTMLButtonElement>;
}) {
  const texts = useMessages().search;
  useIdlePreload(loadPlaceDialog);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [activeField, setActiveField] = useState<PlaceField>("pickup");
  const place = resolveChoice(value.pickup, places);
  const returnPlace = value.differentReturn ? resolveChoice(value.dropoff, places) : null;
  const differentReturn = value.differentReturn;
  const pickupModeLabel = texts.placeTitle[differentReturn ? "pickup" : "pickupAndReturn"];
  const dialogKind: PlaceDialogKind =
    activeField === "dropoff" ? "dropoff" : differentReturn ? "pickup" : "pickupAndReturn";
  const activeChoice = activeField === "dropoff" ? returnPlace : place;
  const savedAddress = activeChoice?.ownAddress
    ? { placeId: activeChoice.place.id, text: activeChoice.ownAddress }
    : null;

  function openPlace(field: PlaceField) {
    setActiveField(field);
    setPlaceOpen(true);
  }

  return (
    <>
      <div className="grid min-w-0 grid-cols-1 border-b-2 border-blue-medium bg-white @lg:col-span-2 @lg:grid-cols-2 @5xl:col-span-1 @5xl:border-r-2 @5xl:border-b-0">
        <div className="min-w-0 border-b-2 border-blue-medium @lg:border-r-2 @lg:border-b-0">
          <BarField
            buttonRef={pickupRef}
            icon={differentReturn ? MapPinCheck : MapPin}
            label={place ? pickupModeLabel : texts.pickupPrompt}
            value={placeValue(place, pickupModeLabel)}
            onClick={() => openPlace("pickup")}
            invalid={invalid.pickup}
          />
        </div>
        <div className="min-w-0">
          {differentReturn ? (
            <div
              data-invalid={invalid.dropoff || undefined}
              className={`flex min-h-16 items-center bg-white has-[[data-clear]:hover]:bg-white ${fieldHover} ${invalidField}`}
            >
              <button
                ref={dropoffRef}
                type="button"
                onClick={() => openPlace("dropoff")}
                className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-inset @5xl:px-5"
              >
                <MapPinMinus
                  className="size-5 shrink-0 text-blue-medium"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs text-blue-dark/75">
                    {returnPlace ? texts.placeTitle.dropoff : texts.dropoffPrompt}
                  </span>
                  <span className="block truncate text-xs font-bold text-blue-dark">
                    {placeValue(returnPlace, texts.placeTitle.dropoff)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                data-clear
                aria-label={texts.sameReturn}
                onClick={() => onChange({ differentReturn: false, dropoff: null })}
                className="mr-3 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-medium/10 motion-reduce:transition-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onChange({ differentReturn: true });
                openPlace("dropoff");
              }}
              className={`flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-inset @5xl:px-5 ${fieldHover}`}
            >
              <Square className="size-5 shrink-0 text-blue-medium" strokeWidth={1.75} aria-hidden />
              <span className="text-xs font-bold text-blue-dark">{texts.otherReturn}</span>
            </button>
          )}
        </div>
      </div>
      <WidgetModal
        open={placeOpen}
        onOpenChange={setPlaceOpen}
        className="h-dvh w-full max-w-none md:h-[calc(100dvh-2rem)] md:w-[48rem] md:max-w-[calc(100%-2rem)] md:rounded-card md:shadow-float"
      >
        <Suspense fallback={<DialogLoading />}>
        <PlaceDialogBody
          key={`${dialogKind}:${savedAddress?.placeId ?? ""}:${savedAddress?.text ?? ""}`}
          places={places}
          kind={dialogKind}
          selectedId={activeChoice?.place.id ?? null}
          savedAddress={savedAddress}
          onOpenChange={setPlaceOpen}
          onSelect={(item, ownAddress) => {
            const chosen: PlaceRef = { id: item.id, address: ownAddress };
            onChange(activeField === "dropoff" ? { dropoff: chosen } : { pickup: chosen });
          }}
        />
        </Suspense>
      </WidgetModal>
    </>
  );
}

function resolveChoice(ref: PlaceRef | null, places: PickupPlace[]): ChosenPlace | null {
  if (!ref) {
    return null;
  }
  const place = places.find((item) => item.id === ref.id);
  return place ? { place, ownAddress: ref.address } : null;
}

function placeValue(chosen: ChosenPlace | null, emptyLabel: string): string {
  if (!chosen) {
    return emptyLabel;
  }
  return chosen.ownAddress ?? chosen.place.name;
}


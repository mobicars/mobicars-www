"use client";

import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { Dialog, Tab, TabList, TabListStateContext, TabPanel, Tabs, type Key } from "react-aria-components";
import {
  CarFront,
  ChevronLeft,
  House,
  LoaderCircle,
  LocateFixed,
  MapPin,
  MapPinCheck,
  MapPinMinus,
  MapPinPlus,
  Plane,
  Search,
  Square,
  SquareCheck,
  TrainFront,
  X,
  type LucideIcon,
} from "lucide-react";

import { BarField, fieldHover, invalidField } from "@/components/reservation/bar-field";
import { DialogHeader, WidgetModal } from "@/components/reservation/dialog-parts";
import { useMyLocation } from "@/components/reservation/use-my-location";
import { intlLocales, type Lang } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { useLang } from "@/i18n/lang-context";
import { useMessages } from "@/i18n/messages-context";
import type { PickupPlace } from "@/lib/reservation/places";
import type { PlaceRef, SearchDraft } from "@/lib/reservation/search";

type PlaceField = "pickup" | "dropoff";
type PlaceView = "search" | "address";
/** What the place dialog asks for; picks its title and search placeholder. */
type PlaceDialogKind = "pickup" | "pickupAndReturn" | "dropoff";

type SavedAddress = {
  placeId: number;
  text: string;
};

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
                  <span className="block truncate text-xxs text-blue-dark/55">
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
        className="h-dvh w-full max-w-none md:h-[calc(100dvh-2rem)] md:w-[48rem] md:max-w-[calc(100%-2rem)] md:rounded-2xl md:shadow-2xl"
      >
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
      </WidgetModal>
    </>
  );
}

function PlaceDialogBody({
  places,
  kind,
  selectedId,
  savedAddress,
  onOpenChange,
  onSelect,
}: {
  places: PickupPlace[];
  kind: PlaceDialogKind;
  selectedId: number | null;
  savedAddress: SavedAddress | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (place: PickupPlace, ownAddress: string | null) => void;
}) {
  const lang = useLang();
  const texts = useMessages().search;
  const title = texts.placeTitle[kind];
  const restoredPlace = savedAddress
    ? (places.find((item) => item.id === savedAddress.placeId && item.customAddresses) ?? null)
    : null;
  const searchRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const addressTitleId = useId();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PlaceView>(restoredPlace ? "address" : "search");
  const [addressPlace, setAddressPlace] = useState<PickupPlace | null>(restoredPlace);
  const [ownAddress, setOwnAddress] = useState(restoredPlace ? (savedAddress?.text ?? "") : "");
  const location = useMyLocation();
  // "Użyj mojej lokalizacji": the city found, and whether it has no points, or is not the address's city.
  const [foundCity, setFoundCity] = useState<string | null>(null);
  const [streetMissing, setStreetMissing] = useState(false);
  const trimmedQuery = query.trim();
  const cities = useMemo(() => uniqueCities(lang, places), [lang, places]);
  const visiblePlaces = useMemo(
    () => places.filter((item) => matchesPlace(lang, item, trimmedQuery)),
    [lang, places, trimmedQuery],
  );

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  useEffect(() => {
    if (view !== "address") {
      searchRef.current?.focus({ preventScroll: true });
      return;
    }
    const timeout = window.setTimeout(() => {
      addressRef.current?.focus({ preventScroll: true });
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [view]);

  function choosePlace(item: PickupPlace) {
    if (item.customAddresses) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setAddressPlace(item);
      setOwnAddress(savedAddress?.placeId === item.id ? savedAddress.text : "");
      setView("address");
      return;
    }
    onSelect(item, null);
    onOpenChange(false);
  }

  function locateCity() {
    location.locate(({ city }) => {
      setFoundCity(city);
      if (city && places.some((item) => matchesPlace(lang, item, city))) {
        setQuery(city);
      }
    });
  }

  function locateAddress() {
    location.locate(({ city, street }) => {
      setFoundCity(city);
      // A square or a field has no street name; the customer types it.
      setStreetMissing(street === null);
      const sameCity = !city || !addressPlace?.city || sameText(lang, city, addressPlace.city);
      const text = [street, sameCity ? null : city].filter(Boolean).join(", ");
      if (street && text) {
        setOwnAddress(text);
      }
    });
  }

  function saveAddress() {
    const typed = ownAddress.trim();
    if (!addressPlace || typed === "") {
      return;
    }
    onSelect(addressPlace, typed);
    onOpenChange(false);
  }

  return (
    <Dialog aria-labelledby={titleId} className="flex h-full min-h-0 flex-col outline-none">
      <DialogHeader titleId={titleId} title={title} className="z-10 pt-4 pb-3" />
      <Tabs
        selectedKey={view}
        onSelectionChange={(key: Key) => setView(key === "address" ? "address" : "search")}
        className="flex min-h-0 flex-1 flex-col outline-none"
      >
        <TabList aria-label={texts.placeViews} className="sr-only">
          <Tab id="search">{texts.placeSearchTab}</Tab>
          <Tab id="address">{texts.ownAddress}</Tab>
        </TabList>
        <TabPanelCarousel>
          <TabPanel
            id="search"
            shouldForceMount
            inert={view !== "search"}
            className="box-border flex h-full max-h-full w-1/2 min-w-0 shrink-0 flex-col overflow-hidden"
          >
            <div className="shrink-0 px-4">
              <label className="relative block">
                <span className="sr-only">{texts.placeSearch[kind]}</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-blue-medium"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={texts.placeSearch[kind]}
                  className="h-12 w-full rounded-xl border border-blue-dark/15 bg-white pr-3 pl-11 text-base outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-medium/50 focus:border-blue-medium focus:bg-blue-medium/5 motion-reduce:transition-none"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6">
              {location.supported ? (
                <div className="mb-5">
                  <LocateButton locating={location.locating} onClick={locateCity} label={texts.useMyLocation} busy={texts.locating} />
                  <LocationNote
                    error={location.error}
                    message={
                      foundCity && !location.locating && !places.some((item) => matchesPlace(lang, item, foundCity))
                        ? fill(texts.locationNoPlaces, { city: foundCity })
                        : null
                    }
                  />
                </div>
              ) : null}
              {trimmedQuery === "" ? (
                <div className="mb-5">
                  <h3 className="mb-3 text-sm font-semibold text-blue-medium">{texts.popularCities}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setQuery(city)}
                        className="rounded-xl bg-blue-medium/10 px-3 py-1.5 text-sm font-medium text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-medium/15 motion-reduce:transition-none"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {visiblePlaces.length === 0 ? (
                <p className="text-sm text-blue-dark/70">
                  {places.length === 0 ? texts.noPlaces : fill(texts.noPlacesFor, { query: trimmedQuery })}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {visiblePlaces.map((item) => {
                    const Icon = placeIcon(item);
                    const selected = item.id === selectedId;
                    return (
                      <li key={item.id}>
                        <button
                          ref={selected ? selectedRef : undefined}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => choosePlace(item)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-200 ease-out motion-reduce:transition-none ${
                            selected
                              ? "border-blue-medium bg-blue-medium text-white hover:border-blue-dark hover:bg-blue-dark"
                              : "border-blue-light bg-white hover:border-blue-medium/40 hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)]"
                          }`}
                        >
                          <Icon
                            className={`size-5 shrink-0 ${selected ? "text-white" : "text-blue-medium"}`}
                            strokeWidth={1.75}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{item.name}</span>
                            {item.address ? (
                              <span className={`block text-xs ${selected ? "text-white/80" : "text-blue-dark/60"}`}>
                                {item.address}
                              </span>
                            ) : null}
                          </span>
                          {selected ? (
                            <SquareCheck className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabPanel>
          <TabPanel
            id="address"
            shouldForceMount
            inert={view !== "address"}
            className="box-border h-full max-h-full w-1/2 min-w-0 shrink-0 overflow-x-hidden overflow-y-auto px-4 pt-1 pb-6"
          >
            <button
              type="button"
              onClick={() => setView("search")}
              className="-ml-2 mb-6 flex w-fit items-center gap-1 rounded-xl px-2 py-1.5 text-base font-semibold transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none"
            >
              <ChevronLeft className="size-5" aria-hidden />
              {texts.back}
            </button>
            <p id={addressTitleId} className="text-lg font-semibold leading-snug">
              {addressPlace?.city ? fill(texts.ownAddressIn, { city: addressPlace.city }) : texts.ownAddressTitle}
            </p>
            <label className="relative mt-4 block">
              <span className="sr-only">{texts.ownAddress}</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-blue-medium"
                aria-hidden
              />
              <input
                ref={addressRef}
                value={ownAddress}
                onChange={(event) => setOwnAddress(event.target.value)}
                placeholder={texts.addressPlaceholder}
                className="h-12 w-full rounded-xl border border-blue-dark/15 bg-white pr-4 pl-11 text-base outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-medium/50 focus:border-blue-medium focus:bg-blue-medium/5 motion-reduce:transition-none"
              />
            </label>
            {location.supported ? (
              <div className="mt-3">
                <LocateButton locating={location.locating} onClick={locateAddress} label={texts.useMyLocation} busy={texts.locating} />
                <LocationNote
                  error={location.error}
                  message={
                    location.locating
                      ? null
                      : streetMissing
                        ? texts.locationNoStreet
                        : foundCity && addressPlace?.city && !sameText(lang, foundCity, addressPlace.city)
                          ? fill(texts.locationOtherCity, { city: foundCity, place: addressPlace.city })
                          : null
                  }
                />
              </div>
            ) : null}
            <button
              type="button"
              disabled={ownAddress.trim() === ""}
              onClick={saveAddress}
              className="mt-4 h-12 w-full rounded-xl bg-blue-medium text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue-medium motion-reduce:transition-none"
            >
              {texts.saveAddress}
            </button>
            <div className="mt-8 rounded-2xl bg-blue-medium/5 p-5">
              <h3 className="text-lg font-semibold">{texts.howItWorks}</h3>
              <ol className="mt-4 flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    1
                  </span>
                  {texts.howStep1}
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    2
                  </span>
                  {texts.howStep2}
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    3
                  </span>
                  {texts.howStep3}
                </li>
              </ol>
            </div>
          </TabPanel>
        </TabPanelCarousel>
      </Tabs>
    </Dialog>
  );
}

function TabPanelCarousel({ children }: { children: ReactNode }) {
  const state = useContext(TabListStateContext);
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const index = state?.selectedItem?.index ?? 0;

  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) {
      return;
    }
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="min-h-0 flex-1 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: "200%",
          transform: `translate3d(${-index * width}px, 0, 0)`,
        }}
      >
        {children}
      </div>
    </div>
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

function placeIcon(place: PickupPlace): LucideIcon {
  if (place.airport) {
    return Plane;
  }
  if (place.trainStation) {
    return TrainFront;
  }
  if (place.office) {
    return House;
  }
  if (place.customAddresses) {
    return MapPinPlus;
  }
  return CarFront;
}

function LocateButton({
  locating,
  onClick,
  label,
  busy,
}: {
  locating: boolean;
  onClick: () => void;
  label: string;
  busy: string;
}) {
  return (
    <button
      type="button"
      disabled={locating}
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-medium/40 text-sm font-semibold text-blue-medium transition-colors duration-200 ease-out hover:bg-blue-medium/5 disabled:opacity-60 motion-reduce:transition-none"
    >
      {locating ? (
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <LocateFixed className="size-4" aria-hidden />
      )}
      {locating ? busy : label}
    </button>
  );
}

function LocationNote({ error, message }: { error: "denied" | "failed" | null; message: string | null }) {
  const texts = useMessages().search;
  const text = error === "denied" ? texts.locationDenied : error === "failed" ? texts.locationFailed : message;
  return text ? (
    <p role="status" className="mt-2 text-xs text-blue-dark/70">
      {text}
    </p>
  ) : null;
}

function sameText(lang: Lang, left: string, right: string): boolean {
  return left.localeCompare(right, intlLocales[lang], { sensitivity: "base" }) === 0;
}

function uniqueCities(lang: Lang, places: PickupPlace[]): string[] {
  const cities = new Set<string>();
  for (const place of places) {
    const city = place.city?.trim();
    if (city) {
      cities.add(city);
    }
  }
  return [...cities].sort((left, right) => left.localeCompare(right, intlLocales[lang]));
}

function matchesPlace(lang: Lang, place: PickupPlace, query: string): boolean {
  if (!query) {
    return true;
  }
  const locale = intlLocales[lang];
  const needle = query.toLocaleLowerCase(locale);
  return [place.name, place.city, place.address].some((value) =>
    value?.toLocaleLowerCase(locale).includes(needle),
  );
}

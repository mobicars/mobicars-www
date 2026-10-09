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
} from "react";
import {
  Button,
  Dialog,
  Modal,
  ModalOverlay,
  Tab,
  TabList,
  TabListStateContext,
  TabPanel,
  Tabs,
  type Key,
} from "react-aria-components";
import {
  CarFront,
  ChevronLeft,
  House,
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

export type PickupPlace = {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  customAddresses: boolean;
  airport: boolean;
  office: boolean;
  trainStation: boolean;
};

type PlaceField = "pickup" | "return";
type PlaceView = "search" | "address";

type SavedAddress = {
  placeId: number;
  text: string;
};

type ChosenPlace = {
  place: PickupPlace;
  ownAddress: string | null;
};

export function PlaceFields({ places }: { places: PickupPlace[] }) {
  const [place, setPlace] = useState<ChosenPlace | null>(null);
  const [returnPlace, setReturnPlace] = useState<ChosenPlace | null>(null);
  const [differentReturn, setDifferentReturn] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [activeField, setActiveField] = useState<PlaceField>("pickup");
  const pickupModeLabel = differentReturn ? "Miejsce odbioru" : "Miejsce odbioru i zwrotu";
  const PickupIcon = differentReturn ? MapPinCheck : MapPin;
  const dialogTitle =
    activeField === "return"
      ? "Miejsce zwrotu"
      : differentReturn
        ? "Miejsce odbioru"
        : "Miejsce odbioru i zwrotu";
  const activeChoice = activeField === "return" ? returnPlace : place;
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
          <button
            type="button"
            onClick={() => openPlace("pickup")}
            className="flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] motion-reduce:transition-none @5xl:px-5"
          >
            <PickupIcon
              className="size-5 shrink-0 text-blue-medium"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-xxs text-blue-dark/55">
                {place ? pickupModeLabel : "Skąd odbierzesz auto?"}
              </span>
              <span className="block truncate text-xs font-bold text-blue-dark">
                {placeValue(place, pickupModeLabel)}
              </span>
            </span>
          </button>
        </div>
        <div className="min-w-0">
          {differentReturn ? (
            <div className="flex min-h-16 items-center bg-white transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] has-[[data-clear]:hover]:bg-white motion-reduce:transition-none">
              <button
                type="button"
                onClick={() => openPlace("return")}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left @5xl:px-5"
              >
                <MapPinMinus
                  className="size-5 shrink-0 text-blue-medium"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-xxs text-blue-dark/55">
                    {returnPlace ? "Miejsce zwrotu" : "Gdzie zwrócisz auto?"}
                  </span>
                  <span className="block truncate text-xs font-bold text-blue-dark">
                    {placeValue(returnPlace, "Miejsce zwrotu")}
                  </span>
                </span>
              </button>
              <button
                type="button"
                data-clear
                aria-label="To samo miejsce zwrotu"
                onClick={() => {
                  setDifferentReturn(false);
                  setReturnPlace(null);
                }}
                className="mr-3 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-blue-dark transition-colors duration-200 ease-out hover:bg-blue-medium/10 motion-reduce:transition-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDifferentReturn(true)}
              className="flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--color-blue-dark)_4%,white)] focus-visible:ring-2 focus-visible:ring-blue-medium focus-visible:ring-inset motion-reduce:transition-none @5xl:px-5"
            >
              <Square
                className="size-5 shrink-0 text-blue-medium"
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="text-xs font-bold text-blue-dark">Inne miejsce zwrotu</span>
            </button>
          )}
        </div>
      </div>
      <PickupPlaceDialog
        open={placeOpen}
        places={places}
        title={dialogTitle}
        selectedId={activeChoice?.place.id ?? null}
        savedAddress={savedAddress}
        onOpenChange={setPlaceOpen}
        onSelect={(item, ownAddress) => {
          const chosen = { place: item, ownAddress };
          if (activeField === "return") {
            setReturnPlace(chosen);
            return;
          }
          setPlace(chosen);
        }}
      />
    </>
  );
}

function PickupPlaceDialog({
  open,
  places,
  title,
  selectedId,
  savedAddress,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  places: PickupPlace[];
  title: string;
  selectedId: number | null;
  savedAddress: SavedAddress | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (place: PickupPlace, ownAddress: string | null) => void;
}) {
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      isDismissable
      className="pickup-overlay fixed inset-0 z-50 flex bg-black/50"
    >
      <Modal className="pickup-modal m-auto flex h-dvh w-full max-w-none flex-col bg-white text-blue-dark outline-none md:h-[calc(100dvh-2rem)] md:w-[48rem] md:max-w-[calc(100%-2rem)] md:rounded-2xl md:shadow-2xl">
        <PlaceDialogBody
          key={`${title}:${savedAddress?.placeId ?? ""}:${savedAddress?.text ?? ""}`}
          places={places}
          title={title}
          selectedId={selectedId}
          savedAddress={savedAddress}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />
      </Modal>
    </ModalOverlay>
  );
}

function PlaceDialogBody({
  places,
  title,
  selectedId,
  savedAddress,
  onOpenChange,
  onSelect,
}: {
  places: PickupPlace[];
  title: string;
  selectedId: number | null;
  savedAddress: SavedAddress | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (place: PickupPlace, ownAddress: string | null) => void;
}) {
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
  const trimmedQuery = query.trim();
  const cities = useMemo(() => uniqueCities(places), [places]);
  const visiblePlaces = useMemo(
    () => places.filter((item) => matchesPlace(item, trimmedQuery)),
    [places, trimmedQuery],
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
      <div className="relative z-10 shrink-0 px-12 pt-4 pb-3">
        <h2 id={titleId} className="text-center text-lg font-semibold">
          {title}
        </h2>
        <Button
          slot="close"
          aria-label="Zamknij"
          className="absolute top-3.5 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted-light text-muted-dark transition-colors duration-200 ease-out hover:bg-muted motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>
      <Tabs
        selectedKey={view}
        onSelectionChange={(key: Key) => setView(key === "address" ? "address" : "search")}
        className="flex min-h-0 flex-1 flex-col outline-none"
      >
        <TabList aria-label="Widok miejsca" className="sr-only">
          <Tab id="search">Wyszukiwarka</Tab>
          <Tab id="address">Własny adres</Tab>
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
                <span className="sr-only">Wyszukaj {title.toLocaleLowerCase("pl")}</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-blue-medium"
                  aria-hidden
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Wyszukaj ${title.toLocaleLowerCase("pl")}`}
                  className="h-12 w-full rounded-xl border border-blue-dark/15 bg-white pr-3 pl-11 text-base outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-medium/50 focus:border-blue-medium focus:bg-blue-medium/5 motion-reduce:transition-none"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6">
              {trimmedQuery === "" ? (
                <div className="mb-5">
                  <h3 className="mb-3 text-sm font-semibold text-blue-medium">Popularne miasta</h3>
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
                  {places.length === 0 ? "Brak miejsc odbioru." : `Brak miejsc dla „${trimmedQuery}”.`}
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
              Powrót
            </button>
            <p id={addressTitleId} className="text-lg font-semibold leading-snug">
              {addressPlace?.city
                ? `Wpisz własny adres w miejscowości ${addressPlace.city}`
                : "Wpisz własny adres"}
            </p>
            <label className="relative mt-4 block">
              <span className="sr-only">Własny adres</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-blue-medium"
                aria-hidden
              />
              <input
                ref={addressRef}
                value={ownAddress}
                onChange={(event) => setOwnAddress(event.target.value)}
                placeholder="Wpisz adres..."
                className="h-12 w-full rounded-xl border border-blue-dark/15 bg-white pr-4 pl-11 text-base outline-none transition-[border-color,background-color] duration-200 ease-out hover:border-blue-medium/50 focus:border-blue-medium focus:bg-blue-medium/5 motion-reduce:transition-none"
              />
            </label>
            <button
              type="button"
              disabled={ownAddress.trim() === ""}
              onClick={saveAddress}
              className="mt-4 h-12 w-full rounded-xl bg-blue-medium text-base font-bold text-white transition-colors duration-200 ease-out hover:bg-blue-dark disabled:opacity-40 disabled:hover:bg-blue-medium motion-reduce:transition-none"
            >
              Zapisz adres
            </button>
            <div className="mt-8 rounded-2xl bg-blue-medium/5 p-5">
              <h3 className="text-lg font-semibold">Jak to działa?</h3>
              <ol className="mt-4 flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    1
                  </span>
                  Wpisz swój adres
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    2
                  </span>
                  Wybierz datę i godzinę podstawienia
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-medium text-xs font-bold text-white">
                    3
                  </span>
                  Dostarczymy auto pod same drzwi
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

function uniqueCities(places: PickupPlace[]): string[] {
  const cities = new Set<string>();
  for (const place of places) {
    const city = place.city?.trim();
    if (city) {
      cities.add(city);
    }
  }
  return [...cities].sort((left, right) => left.localeCompare(right, "pl"));
}

function matchesPlace(place: PickupPlace, query: string): boolean {
  if (!query) {
    return true;
  }
  const needle = query.toLocaleLowerCase("pl");
  return [place.name, place.city, place.address].some((value) =>
    value?.toLocaleLowerCase("pl").includes(needle),
  );
}

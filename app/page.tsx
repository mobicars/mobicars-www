import {
  listOffers,
  listServicePoints,
  RentCarSoftError,
  type Offer,
  type ServicePoint,
} from "@/lib/rentcarsoft";

import { LoginForm } from "./login-form";

export default async function Home() {
  const [loaded, points] = await Promise.all([loadOffers(), loadServicePoints()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">
          Oferty
          {loaded.error ? null : (
            <span className="ml-2 text-base font-normal text-zinc-500">
              {loaded.offers.length}
              {loaded.offers.length === 999 ? " (pełna strona 999)" : ""}
            </span>
          )}
        </h1>
        {loaded.error ? (
          <p className="text-sm">
            API: {loaded.error}
            {loaded.status !== null ? ` (HTTP ${loaded.status})` : ""}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {loaded.offers.map((offer) => (
              <li key={offer.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {offer.brand} {offer.model}
                  <span className="ml-2 text-sm text-zinc-500">#{offer.id}</span>
                </span>
                <span className="text-sm tabular-nums">
                  {offer.dailyPrice === null ? "—" : `${offer.dailyPrice} zł / doba`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex max-w-sm flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Punkty obsługi
          {points.error ? null : (
            <span className="ml-2 text-base font-normal text-zinc-500">{points.items.length}</span>
          )}
        </h2>
        {points.error ? (
          <p className="text-sm">
            API: {points.error}
            {points.status !== null ? ` (HTTP ${points.status})` : ""}
          </p>
        ) : (
          <select
            name="servicePointId"
            defaultValue=""
            className="h-10 rounded-md border border-zinc-300 px-3 dark:border-zinc-700"
          >
            <option value="" disabled>
              Wybierz punkt
            </option>
            {points.items.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} #{point.id}
                {point.active ? "" : " (nieaktywny)"}
              </option>
            ))}
          </select>
        )}
      </section>
      <section className="flex max-w-sm flex-col gap-4">
        <h2 className="text-xl font-semibold">Logowanie</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Bez sesji. Formularz pokazuje tylko to, co zwróci login.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}

async function loadServicePoints(): Promise<{
  items: ServicePoint[];
  error: string | null;
  status: number | null;
}> {
  try {
    const items = await listServicePoints({ lang: "pl", includeInactive: true });
    return { items, error: null, status: null };
  } catch (error) {
    if (error instanceof RentCarSoftError) {
      return { items: [], error: error.code, status: error.status ?? null };
    }
    throw error;
  }
}

async function loadOffers(): Promise<{
  offers: Offer[];
  error: string | null;
  status: number | null;
}> {
  try {
    const offers = await listOffers({ lang: "pl", perPage: 999 });
    return { offers, error: null, status: null };
  } catch (error) {
    if (error instanceof RentCarSoftError) {
      return { offers: [], error: error.code, status: error.status ?? null };
    }
    throw error;
  }
}

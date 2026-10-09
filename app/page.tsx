import { listServicePoints, RentCarSoftError } from "@/lib/rentcarsoft";

import { ReservationPicker, type PickupPlace } from "@/components/reservation-picker";

export default async function Home() {
  const places = await loadPickupPlaces();

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex min-h-screen items-center bg-linear-to-br from-blue-medium to-blue-dark px-3 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <ReservationPicker layout="horizontal" places={places} />
        </div>
      </div>
      <div className="flex min-h-screen items-center bg-linear-to-br from-blue-medium to-blue-dark px-3 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <ReservationPicker layout="vertical" places={places} />
        </div>
      </div>
    </main>
  );
}

async function loadPickupPlaces(): Promise<PickupPlace[]> {
  try {
    const points = await listServicePoints({ lang: "pl" });
    return points.map((point) => ({
      id: point.id,
      name: point.name,
      city: point.attributes.city?.value.trim() || null,
      address: point.attributes.address?.value.trim() || null,
      customAddresses: point.customAddresses,
      airport: point.airport,
      office: isYes(point.attributes.isOffice, 13),
      trainStation: isYes(point.attributes.isTrainStation, 9),
    }));
  } catch (error) {
    if (error instanceof RentCarSoftError) {
      return [];
    }
    throw error;
  }
}

function isYes(
  attribute: { value: string; valueId: number | null } | undefined,
  yesId: number,
): boolean {
  if (!attribute) {
    return false;
  }
  if (attribute.valueId === yesId) {
    return true;
  }
  const value = attribute.value.trim().toLocaleLowerCase("pl");
  return value === "tak" || value === "yes";
}

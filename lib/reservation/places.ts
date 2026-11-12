import type { ServicePoint } from "@/lib/rentcarsoft";

/** What the widget needs about a pickup point. Keeps the client payload small. */
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

export function toPickupPlace(point: ServicePoint): PickupPlace {
  return {
    id: point.id,
    name: point.name,
    city: point.city,
    address: point.address,
    customAddresses: point.customAddresses,
    airport: point.airport,
    office: point.office,
    trainStation: point.trainStation,
  };
}

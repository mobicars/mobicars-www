import { Building2, Plane, TrainFront, type LucideIcon } from "lucide-react";

export type MapKind = "airport" | "station" | "office";

/**
 * A map marker per kind of pickup point: the brand colour and an icon, shared
 * by the map (client) and its legend (server), so it lives outside the
 * `"use client"` file: a constant exported from there reaches the server as a
 * client reference, not as this object.
 */
export const KINDS: Record<MapKind, { icon: LucideIcon; colour: string }> = {
  airport: { icon: Plane, colour: "bg-blue-dark" },
  station: { icon: TrainFront, colour: "bg-blue-medium" },
  office: { icon: Building2, colour: "bg-green-medium" },
};

import { Tunneller } from "@/types/tunnellers";

export type OriginMarker = {
  town: string;
  latitude: number;
  longitude: number;
  count: number;
};

export function getOriginMarkers(
  tunnellers: Record<string, Tunneller[]>,
): OriginMarker[] {
  const markersByCoordinate = new Map<string, OriginMarker>();

  Object.values(tunnellers)
    .flat()
    .forEach((tunneller) => {
      const residence = tunneller.origin.residence;
      if (
        !residence.town ||
        residence.latitude === null ||
        residence.longitude === null
      ) {
        return;
      }

      const key = `${residence.latitude},${residence.longitude}`;
      const marker = markersByCoordinate.get(key);
      if (marker) {
        marker.count += 1;
        return;
      }

      markersByCoordinate.set(key, {
        town: residence.town,
        latitude: residence.latitude,
        longitude: residence.longitude,
        count: 1,
      });
    });

  return Array.from(markersByCoordinate.values());
}

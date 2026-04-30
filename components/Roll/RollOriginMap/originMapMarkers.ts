import { Tunneller } from "@/types/tunnellers";

export type OriginMarker = {
  town: string;
  latitude: number;
  longitude: number;
  count: number;
  tunnellers: Tunneller[];
};

export type OriginMapSummary = {
  markers: OriginMarker[];
  visibleCount: number;
  mappedCount: number;
  missingOriginCount: number;
};

export function getOriginMapSummary(
  tunnellers: Record<string, Tunneller[]>,
): OriginMapSummary {
  const markersByCoordinate = new Map<string, OriginMarker>();
  const visibleTunnellers = Object.values(tunnellers).flat();

  visibleTunnellers.forEach((tunneller) => {
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
      marker.tunnellers.push(tunneller);
      return;
    }

    markersByCoordinate.set(key, {
      town: residence.town,
      latitude: residence.latitude,
      longitude: residence.longitude,
      count: 1,
      tunnellers: [tunneller],
    });
  });

  const markers = Array.from(markersByCoordinate.values());
  const mappedCount = markers.reduce(
    (total, marker) => total + marker.count,
    0,
  );

  return {
    markers,
    visibleCount: visibleTunnellers.length,
    mappedCount,
    missingOriginCount: visibleTunnellers.length - mappedCount,
  };
}

export function getOriginMarkers(
  tunnellers: Record<string, Tunneller[]>,
): OriginMarker[] {
  return getOriginMapSummary(tunnellers).markers;
}

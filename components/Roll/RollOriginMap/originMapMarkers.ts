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
  missingOriginTunnellers: Tunneller[];
};

export function getOriginMarkerRadius(count: number): number {
  return count > 1 ? 8 + Math.min(count, 20) : 7;
}

export function getOriginMarkerStyle(isSelected: boolean) {
  return {
    color: isSelected ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.85)",
    fillColor: isSelected ? "rgb(255, 255, 255)" : "rgb(153, 131, 100)",
    fillOpacity: isSelected ? 1 : 0.85,
    weight: isSelected ? 2 : 1,
  };
}

export function createMissingOriginMarker(
  town: string,
  tunnellers: Tunneller[],
): OriginMarker {
  return {
    town,
    latitude: Number.NaN,
    longitude: Number.NaN,
    count: tunnellers.length,
    tunnellers,
  };
}

export function getOriginMapSummary(
  tunnellers: Record<string, Tunneller[]>,
): OriginMapSummary {
  const markersByCoordinate = new Map<string, OriginMarker>();
  const visibleTunnellers = Object.values(tunnellers).flat();
  const missingOriginTunnellers: Tunneller[] = [];

  visibleTunnellers.forEach((tunneller) => {
    const residence = tunneller.origin.residence;
    if (
      !residence.town ||
      residence.latitude === null ||
      residence.longitude === null
    ) {
      missingOriginTunnellers.push(tunneller);
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
    missingOriginTunnellers,
  };
}

export function getOriginMarkers(
  tunnellers: Record<string, Tunneller[]>,
): OriginMarker[] {
  return getOriginMapSummary(tunnellers).markers;
}

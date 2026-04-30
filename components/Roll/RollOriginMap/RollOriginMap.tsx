"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";

import { Tunneller } from "@/types/tunnellers";

import { getOriginMarkers } from "./originMapMarkers";
import STYLES from "./RollOriginMap.module.scss";

type Props = {
  tunnellers: Record<string, Tunneller[]>;
};

export function RollOriginMap({ tunnellers }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markers = useMemo(() => getOriginMarkers(tunnellers), [tunnellers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [-41.2865, 174.7762],
      5,
    );

    const markerLayer = L.layerGroup().addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    markers.forEach((marker) => {
      const radius = marker.count > 1 ? 8 + Math.min(marker.count, 20) : 7;
      L.circleMarker([marker.latitude, marker.longitude], {
        radius,
        color: "rgba(255, 255, 255, 0.85)",
        weight: 1,
        fillColor: "rgb(153, 131, 100)",
        fillOpacity: 0.85,
      })
        .bindTooltip(`${marker.town} (${marker.count})`)
        .addTo(markerLayer);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [markers]);

  return (
    <div className={STYLES.container} data-testid="roll-origin-map">
      <div ref={containerRef} className={STYLES.map} />
    </div>
  );
}

"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

import { WorkData } from "@/utils/database/queries/worksQuery";

import STYLES from "./WorksMap.module.scss";

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/map/marker-icon-2x.png",
  iconUrl: "/images/map/marker-icon.png",
  shadowUrl: "/images/map/marker-shadow.png",
});

type Props = {
  works: WorkData[];
  locale: string;
};

const MARKER_COLOR = "rgb(153, 131, 100)";

function createDotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.6);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

export function WorksMap({ works, locale }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the sticky menu element and add the same top margin it would
    // have when sticky is active on scrollable pages
    const stickyEl = Array.from(
      document.querySelectorAll<HTMLElement>("*"),
    ).find((el) => window.getComputedStyle(el).position === "sticky");
    const stickyTop = stickyEl
      ? parseInt(window.getComputedStyle(stickyEl).top, 10)
      : 0;
    if (stickyEl) stickyEl.style.marginTop = `${stickyTop}px`;
    return () => {
      if (stickyEl) stickyEl.style.marginTop = "";
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    works.forEach((work) => {
      const icon = createDotIcon(MARKER_COLOR);
      const type = locale === "fr" ? work.work_type_fr : work.work_type_en;

      const popup = `
        <div class="work-popup">
          <strong>${work.work_name}</strong><br/>
          ${type ? `<em>${type}</em><br/>` : ""}
          ${work.work_section ? `Section ${work.work_section}<br/>` : ""}
          ${work.work_date_start ? `${work.work_date_start}${work.work_date_end && work.work_date_end !== work.work_date_start ? ` → ${work.work_date_end}` : ""}` : ""}
        </div>
      `;

      L.marker([work.work_latitude, work.work_longitude], { icon })
        .addTo(map)
        .bindPopup(popup);
    });

    const bounds = L.latLngBounds(
      works.map((w) => [w.work_latitude, w.work_longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [30, 30] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [works, locale]);

  return (
    <div className={STYLES.container}>
      <div ref={containerRef} className={STYLES.map} />
    </div>
  );
}

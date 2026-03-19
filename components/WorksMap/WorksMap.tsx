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

const TYPE_COLORS: Record<string, string> = {
  Dugout: "#8B6914",
  "Machine-gun nest": "#8B0000",
  "Machine-gun nest – Dugout": "#8B0000",
  "Trench mortar battery": "#2F4F2F",
  Trench: "#696969",
  "Company headquarters": "#00008B",
  "Brigade headquarters": "#00008B",
  "Division headquarters": "#00008B",
  "Observation post": "#4B0082",
};

function getColor(type: string | null): string {
  if (!type) return "#888888";
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (type.startsWith(key)) return color;
  }
  return "#888888";
}

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

    const map = L.map(containerRef.current, {
      center: [50.29, 2.78],
      zoom: 12,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    works.forEach((work) => {
      const color = getColor(work.work_type_en);
      const icon = createDotIcon(color);
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

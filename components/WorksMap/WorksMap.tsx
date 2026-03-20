"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { WorkData } from "@/utils/database/queries/worksQuery";

import { InfoBar } from "./InfoBar/InfoBar";
import { TypeFilter } from "./TypeFilter/TypeFilter";
import STYLES from "./WorksMap.module.scss";
import { WorksSlider } from "./WorksSlider/WorksSlider";

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
const MARKER_COLOR_ACTIVE = "rgb(255, 255, 255)";

function createDotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.6);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function dateToMonth(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 12 + d.getMonth();
}

export function WorksMap({ works, locale }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<
    Array<{ marker: L.Marker; start: number; end: number; type: string | null }>
  >([]);

  const allMonths = useMemo(
    () =>
      works.map((w) => ({
        start: dateToMonth(w.work_date_start!),
        end: dateToMonth(w.work_date_end || w.work_date_start!),
      })),
    [works],
  );
  const minMonth = Math.min(...allMonths.map((m) => m.start));
  const maxMonth = Math.max(...allMonths.map((m) => m.end));

  const [dateRange, setDateRange] = useState<[number, number]>([
    minMonth,
    maxMonth,
  ]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [displayedWork, setDisplayedWork] = useState<WorkData | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const displayedWorkRef = useRef<WorkData | null>(null);
  const nextWorkRef = useRef<WorkData | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  const types = useMemo(() => {
    const typeSet = new Set<string>();
    works.forEach((w) => {
      const type = locale === "fr" ? w.work_type_fr : w.work_type_en;
      if (type) typeSet.add(type);
    });
    return Array.from(typeSet).sort();
  }, [works, locale]);

  const selectWork = useCallback((work: WorkData | null) => {
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    if (!displayedWorkRef.current) {
      displayedWorkRef.current = work;
      setDisplayedWork(work);
    } else {
      nextWorkRef.current = work;
      setIsExiting(true);
      exitTimeoutRef.current = setTimeout(() => {
        displayedWorkRef.current = nextWorkRef.current;
        setDisplayedWork(nextWorkRef.current);
        setIsExiting(false);
      }, 150);
    }
  }, []);

  const closeInfo = useCallback(() => {
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setIcon(createDotIcon(MARKER_COLOR));
      selectedMarkerRef.current = null;
    }
    selectWork(null);
  }, [selectWork]);

  useEffect(() => {
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

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    markersRef.current = works.map((work, i) => {
      const icon = createDotIcon(MARKER_COLOR);

      const marker = L.marker([work.work_latitude, work.work_longitude], {
        icon,
      })
        .addTo(map)
        .on("click", () => {
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.setIcon(createDotIcon(MARKER_COLOR));
          }
          marker.setIcon(createDotIcon(MARKER_COLOR_ACTIVE));
          selectedMarkerRef.current = marker;
          selectWork(work);
        });

      const type = locale === "fr" ? work.work_type_fr : work.work_type_en;
      return {
        marker,
        start: allMonths[i].start,
        end: allMonths[i].end,
        type: type ?? null,
      };
    });

    map.on("click", () => closeInfo());

    const bounds = L.latLngBounds(
      works.map((w) => [w.work_latitude, w.work_longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [30, 30] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [works, locale, allMonths, selectWork, closeInfo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const [from, to] = dateRange;
    markersRef.current.forEach(({ marker, start, end, type }) => {
      const s = Math.min(start, end);
      const e = Math.max(start, end);
      const dateVisible = isNaN(s) || (s <= to && e >= from);
      const typeVisible = !selectedType || type === selectedType;
      if (dateVisible && typeVisible) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) marker.remove();
      }
    });
  }, [dateRange, selectedType]);

  const visibleCount = works.filter((w, i) => {
    const { start, end } = allMonths[i];
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const dateVisible = isNaN(s) || (s <= dateRange[1] && e >= dateRange[0]);
    const type = locale === "fr" ? w.work_type_fr : w.work_type_en;
    const typeVisible = !selectedType || type === selectedType;
    return dateVisible && typeVisible;
  }).length;

  const zoom = useCallback((dir: 1 | -1) => {
    mapRef.current?.[dir === 1 ? "zoomIn" : "zoomOut"]();
  }, []);

  return (
    <div className={STYLES.container}>
      <div ref={containerRef} className={STYLES.map} />
      <div className={STYLES["map-controls"]}>
        {displayedWork && (
          <InfoBar
            work={displayedWork}
            isExiting={isExiting}
            locale={locale}
            onClose={closeInfo}
          />
        )}
        <div className={STYLES.controls}>
          <div className={STYLES["slider-count"]}>
            {visibleCount} {visibleCount === 1 ? "work" : "works"}
          </div>
          <TypeFilter
            types={types}
            selectedType={selectedType}
            onChange={setSelectedType}
            onOpen={closeInfo}
          />
          <div className={STYLES.zoom}>
            <button onClick={() => zoom(1)} aria-label="Zoom in">
              +
            </button>
            <button onClick={() => zoom(-1)} aria-label="Zoom out">
              −
            </button>
          </div>
        </div>
        <WorksSlider
          dateRange={dateRange}
          onChange={setDateRange}
          minMonth={minMonth}
          maxMonth={maxMonth}
        />
      </div>
    </div>
  );
}

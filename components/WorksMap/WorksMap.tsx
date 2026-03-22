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
const COORD_TOLERANCE = 0.0001;

function createGroupIcon(color: string, count: number) {
  if (count === 1) {
    return L.divIcon({
      className: "",
      html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.6);"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.8);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgb(29,31,32);font-family:sans-serif;">${count}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
    Array<{
      marker: L.Marker;
      groupWorks: WorkData[];
      starts: number[];
      ends: number[];
      categories1: (string | null)[];
      categories2: (string | null)[];
    }>
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
  const stackedWorksRef = useRef<WorkData[]>([]);
  const stackIndexRef = useRef(0);
  const [stackIndex, setStackIndex] = useState(0);
  const [stackTotal, setStackTotal] = useState(0);
  const [animType, setAnimType] = useState<
    "default" | "fade" | "slide-next" | "slide-prev"
  >("default");
  const exitDurationRef = useRef(150);

  const types = useMemo(() => {
    const categorySet = new Set<string>();
    works.forEach((w) => {
      const cat1 =
        locale === "fr" ? w.work_category_1_fr : w.work_category_1_en;
      const cat2 =
        locale === "fr" ? w.work_category_2_fr : w.work_category_2_en;
      if (cat1) categorySet.add(cat1);
      if (cat2) categorySet.add(cat2);
    });
    return Array.from(categorySet).sort();
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
      }, exitDurationRef.current);
    }
  }, []);

  const closeInfo = useCallback(() => {
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setIcon(
        createGroupIcon(MARKER_COLOR, stackedWorksRef.current.length || 1),
      );
      selectedMarkerRef.current = null;
    }
    stackedWorksRef.current = [];
    stackIndexRef.current = 0;
    setStackIndex(0);
    setStackTotal(0);
    selectWork(null);
  }, [selectWork]);

  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      const stack = stackedWorksRef.current;
      if (stack.length <= 1) return;
      const newIndex =
        (stackIndexRef.current + direction + stack.length) % stack.length;
      stackIndexRef.current = newIndex;
      setStackIndex(newIndex);
      setAnimType(direction === 1 ? "slide-next" : "slide-prev");
      exitDurationRef.current = 250;
      selectWork(stack[newIndex]);
    },
    [selectWork],
  );

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

    // Group works by location
    const groups: WorkData[][] = [];
    works.forEach((work) => {
      const existing = groups.find(
        (g) =>
          Math.abs(g[0].work_latitude - work.work_latitude) < COORD_TOLERANCE &&
          Math.abs(g[0].work_longitude - work.work_longitude) < COORD_TOLERANCE,
      );
      if (existing) existing.push(work);
      else groups.push([work]);
    });

    markersRef.current = groups.map((groupWorks) => {
      const rep = groupWorks[0];
      const count = groupWorks.length;
      const icon = createGroupIcon(MARKER_COLOR, count);

      const marker = L.marker([rep.work_latitude, rep.work_longitude], { icon })
        .addTo(map)
        .on("click", () => {
          if (selectedMarkerRef.current) {
            const prevCount = stackedWorksRef.current.length || 1;
            selectedMarkerRef.current.setIcon(
              createGroupIcon(MARKER_COLOR, prevCount),
            );
          }
          marker.setIcon(createGroupIcon(MARKER_COLOR_ACTIVE, count));
          selectedMarkerRef.current = marker;
          map.panTo(marker.getLatLng());
          stackedWorksRef.current = groupWorks;
          stackIndexRef.current = 0;
          setStackIndex(0);
          setStackTotal(groupWorks.length);
          setAnimType("fade");
          exitDurationRef.current = 300;
          selectWork(groupWorks[0]);
        });

      const worksMonths = groupWorks.map((w) => {
        const idx = works.indexOf(w);
        return { start: allMonths[idx].start, end: allMonths[idx].end };
      });

      return {
        marker,
        groupWorks,
        starts: worksMonths.map((m) => m.start),
        ends: worksMonths.map((m) => m.end),
        categories1: groupWorks.map(
          (w) =>
            (locale === "fr" ? w.work_category_1_fr : w.work_category_1_en) ??
            null,
        ),
        categories2: groupWorks.map(
          (w) =>
            (locale === "fr" ? w.work_category_2_fr : w.work_category_2_en) ??
            null,
        ),
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
    markersRef.current.forEach(
      ({ marker, starts, ends, categories1, categories2 }) => {
        const groupVisible = starts.some((_, i) => {
          const s = Math.min(starts[i], ends[i]);
          const e = Math.max(starts[i], ends[i]);
          const dateVisible = isNaN(s) || (s <= to && e >= from);
          const typeVisible =
            !selectedType ||
            categories1[i] === selectedType ||
            categories2[i] === selectedType;
          return dateVisible && typeVisible;
        });
        if (groupVisible) {
          if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
          if (map.hasLayer(marker)) marker.remove();
        }
      },
    );
  }, [dateRange, selectedType]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const visible = markersRef.current
      .filter(({ marker }) => map.hasLayer(marker))
      .map(({ marker }) => marker.getLatLng());
    if (visible.length === 0) return;
    const bounds = L.latLngBounds(visible);
    const zoom = map.getBoundsZoom(bounds, false);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: zoom - 1 });
  }, [selectedType]);

  const visibleCount = works.filter((w, i) => {
    const { start, end } = allMonths[i];
    const s = Math.min(start, end);
    const e = Math.max(start, end);
    const dateVisible = isNaN(s) || (s <= dateRange[1] && e >= dateRange[0]);
    const cat1 = locale === "fr" ? w.work_category_1_fr : w.work_category_1_en;
    const cat2 = locale === "fr" ? w.work_category_2_fr : w.work_category_2_en;
    const typeVisible =
      !selectedType || cat1 === selectedType || cat2 === selectedType;
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
            animType={animType}
            locale={locale}
            onClose={closeInfo}
            stackTotal={stackTotal > 1 ? stackTotal : undefined}
            stackIndex={stackIndex}
            onNavigate={handleNavigate}
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

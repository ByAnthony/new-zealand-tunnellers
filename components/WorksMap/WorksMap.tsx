"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { WorkData } from "@/utils/database/queries/worksQuery";

import {
  collectCategories,
  getWorkCategories,
  isWorkVisible,
} from "./filterUtils";
import { InfoBar } from "./InfoBar/InfoBar";
import {
  CATEGORY_COLORS,
  MARKER_COLOR_ACTIVE,
  createGroupIcon,
  createSingleIcon,
  createWorkIcon,
} from "./markerIcons";
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

const COORD_TOLERANCE = 0.0001;
const EXIT_DURATION_DEFAULT = 150;
const EXIT_DURATION_SLIDE = 250;
const EXIT_DURATION_FADE = 300;

function dateToMonth(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 12 + d.getMonth();
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function WorksMap({ works, locale }: Props) {
  const t = useTranslations("maps");
  const searchParams = useSearchParams();
  const isFirstRenderRef = useRef(true);
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

  const { types, typeColors, nameToSlug, slugToName } = useMemo(() => {
    const categorySet = new Set<string>();
    const colorMap: Record<string, string> = {};
    const n2s = new Map<string, string>();
    const s2n = new Map<string, string>();
    works.forEach((w) => {
      const [cat1, cat2] = getWorkCategories(w, locale);
      if (cat1) {
        categorySet.add(cat1);
        if (w.work_category_1_en && CATEGORY_COLORS[w.work_category_1_en]) {
          colorMap[cat1] = CATEGORY_COLORS[w.work_category_1_en];
        }
        if (w.work_category_1_en) {
          const slug = toSlug(w.work_category_1_en);
          n2s.set(cat1, slug);
          s2n.set(slug, cat1);
        }
      }
      if (cat2) {
        categorySet.add(cat2);
        if (w.work_category_2_en && CATEGORY_COLORS[w.work_category_2_en]) {
          colorMap[cat2] = CATEGORY_COLORS[w.work_category_2_en];
        }
        if (w.work_category_2_en) {
          const slug = toSlug(w.work_category_2_en);
          n2s.set(cat2, slug);
          s2n.set(slug, cat2);
        }
      }
    });
    return {
      types: Array.from(categorySet).sort(),
      typeColors: colorMap,
      nameToSlug: n2s,
      slugToName: s2n,
    };
  }, [works, locale]);

  const [dateRange, setDateRange] = useState<[number, number]>([
    minMonth,
    maxMonth,
  ]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => {
    const typesParam = searchParams.get("type");
    if (!typesParam) return new Set<string>();
    const matched = typesParam
      .split(",")
      .map((slug) => slugToName.get(slug))
      .filter((name): name is string => name !== undefined);
    return new Set(matched);
  });
  const [displayedWork, setDisplayedWork] = useState<WorkData | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const displayedWorkRef = useRef<WorkData | null>(null);
  const nextWorkRef = useRef<WorkData | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const selectedTypesRef = useRef<Set<string>>(new Set());
  const dateRangeRef = useRef<[number, number]>([minMonth, maxMonth]);
  const stackedWorksRef = useRef<WorkData[]>([]);
  const stackIndexRef = useRef(0);
  const [stackIndex, setStackIndex] = useState(0);
  const [stackTotal, setStackTotal] = useState(0);
  const [animType, setAnimType] = useState<
    "default" | "fade" | "slide-next" | "slide-prev"
  >("default");
  const exitDurationRef = useRef(EXIT_DURATION_DEFAULT);

  const typeColorsRef = useRef(typeColors);
  selectedTypesRef.current = selectedTypes;
  dateRangeRef.current = dateRange;
  typeColorsRef.current = typeColors;

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const slugs = Array.from(selectedTypes)
      .map((name) => nameToSlug.get(name) ?? toSlug(name))
      .sort()
      .join(",");
    const params = new URLSearchParams(window.location.search);
    if (slugs) {
      params.set("type", slugs);
    } else {
      params.delete("type");
    }
    const qs = params.toString().replace(/%2C/gi, ",");
    const currentQs = window.location.search.replace(/^\?/, "");
    if (qs === currentQs) return;
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [selectedTypes, nameToSlug]);

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
      const stack = stackedWorksRef.current;
      const count = stack.length || 1;
      const cats = collectCategories(stack, locale);
      selectedMarkerRef.current.setIcon(
        createWorkIcon(cats, count, typeColorsRef.current),
      );
      selectedMarkerRef.current = null;
    }
    stackedWorksRef.current = [];
    stackIndexRef.current = 0;
    setStackIndex(0);
    setStackTotal(0);
    selectWork(null);
  }, [selectWork, locale]);

  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      const stack = stackedWorksRef.current;
      if (stack.length <= 1) return;
      const newIndex =
        (stackIndexRef.current + direction + stack.length) % stack.length;
      stackIndexRef.current = newIndex;
      setStackIndex(newIndex);
      setAnimType(direction === 1 ? "slide-next" : "slide-prev");
      exitDurationRef.current = EXIT_DURATION_SLIDE;
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

    // Group works by location using a Map keyed by snapped coordinates (O(n))
    const snapCoord = (n: number) =>
      Math.round(n / COORD_TOLERANCE) * COORD_TOLERANCE;
    const groupMap = new Map<string, WorkData[]>();
    works.forEach((work) => {
      const key = `${snapCoord(work.work_latitude)},${snapCoord(work.work_longitude)}`;
      const existing = groupMap.get(key);
      if (existing) existing.push(work);
      else groupMap.set(key, [work]);
    });
    const groups = Array.from(groupMap.values());

    markersRef.current = groups.map((groupWorks) => {
      const rep = groupWorks[0];
      const count = groupWorks.length;
      const groupCats = collectCategories(groupWorks, locale);
      const icon = createWorkIcon(groupCats, count, typeColorsRef.current);

      const marker = L.marker([rep.work_latitude, rep.work_longitude], { icon })
        .addTo(map)
        .on("click", () => {
          if (selectedMarkerRef.current) {
            const prev = stackedWorksRef.current;
            const prevCount = prev.length || 1;
            const prevCats = collectCategories(prev, locale);
            selectedMarkerRef.current.setIcon(
              createWorkIcon(prevCats, prevCount, typeColorsRef.current),
            );
          }

          const filtered = groupWorks.filter((w) => {
            const idx = works.indexOf(w);
            const [c1, c2] = getWorkCategories(w, locale);
            return isWorkVisible(
              allMonths[idx].start,
              allMonths[idx].end,
              c1,
              c2,
              dateRangeRef.current,
              selectedTypesRef.current,
            );
          });
          if (filtered.length === 0) return;

          marker.setIcon(
            filtered.length === 1
              ? createSingleIcon(MARKER_COLOR_ACTIVE, null)
              : createGroupIcon(
                  MARKER_COLOR_ACTIVE,
                  filtered.length,
                  "rgb(29,31,32)",
                ),
          );
          selectedMarkerRef.current = marker;
          map.panTo(marker.getLatLng());
          stackedWorksRef.current = filtered;
          stackIndexRef.current = 0;
          setStackIndex(0);
          setStackTotal(filtered.length);
          setAnimType("fade");
          exitDurationRef.current = EXIT_DURATION_FADE;
          selectWork(filtered[0]);
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
        categories1: groupWorks.map((w) => getWorkCategories(w, locale)[0]),
        categories2: groupWorks.map((w) => getWorkCategories(w, locale)[1]),
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
    markersRef.current.forEach(
      ({ marker, starts, ends, categories1, categories2 }) => {
        let count = 0;
        const visibleCats = new Set<string>();
        starts.forEach((_, i) => {
          if (
            isWorkVisible(
              starts[i],
              ends[i],
              categories1[i],
              categories2[i],
              dateRange,
              selectedTypes,
            )
          ) {
            count++;
            if (categories1[i]) visibleCats.add(categories1[i]);
            if (categories2[i]) visibleCats.add(categories2[i]);
          }
        });
        if (count > 0) {
          if (!map.hasLayer(marker)) marker.addTo(map);
          if (marker !== selectedMarkerRef.current) {
            marker.setIcon(createWorkIcon(visibleCats, count, typeColors));
          }
        } else {
          if (map.hasLayer(marker)) marker.remove();
        }
      },
    );
  }, [dateRange, selectedTypes, typeColors]);

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
  }, [selectedTypes]);

  const visibleCount = works.filter((w, i) => {
    const [cat1, cat2] = getWorkCategories(w, locale);
    return isWorkVisible(
      allMonths[i].start,
      allMonths[i].end,
      cat1,
      cat2,
      dateRange,
      selectedTypes,
    );
  }).length;

  const toggleType = useCallback(
    (type: string) => {
      closeInfo();
      setSelectedTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return next;
      });
    },
    [closeInfo],
  );

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
            colors={typeColors}
            onClose={closeInfo}
            stackTotal={stackTotal > 1 ? stackTotal : undefined}
            stackIndex={stackIndex}
            onNavigate={handleNavigate}
          />
        )}
        <div className={STYLES["filter-row"]}>
          <div className={STYLES["slider-count"]}>
            {visibleCount} {visibleCount === 1 ? t("work") : t("works")}
          </div>
          <TypeFilter
            types={types}
            selectedTypes={selectedTypes}
            onToggle={toggleType}
            colors={typeColors}
          />
        </div>
        <div className={STYLES["slider-row"]}>
          <WorksSlider
            dateRange={dateRange}
            onChange={setDateRange}
            minMonth={minMonth}
            maxMonth={maxMonth}
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
      </div>
    </div>
  );
}

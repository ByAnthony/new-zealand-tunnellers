"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { CaveData, CavePathPoint } from "@/utils/database/queries/cavesQuery";
import { WorkData, WorkPathPoint } from "@/utils/database/queries/worksQuery";

import {
  collectCategories,
  getWorkCategories,
  isWorkVisible,
} from "./filterUtils";
import { InfoBar } from "./InfoBar/InfoBar";
import { dateToMonth, monthToParam, paramToMonth, toSlug } from "./mapParams";
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
  paths: WorkPathPoint[];
  caves: CaveData[];
  cavePaths: CavePathPoint[];
  locale: string;
};

const COORD_TOLERANCE = 0.0001;
const EXIT_DURATION_DEFAULT = 150;
const EXIT_DURATION_SLIDE = 250;
const EXIT_DURATION_FADE = 300;

export function WorksMap({ works, paths, caves, cavePaths, locale }: Props) {
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

  const [dateRange, setDateRange] = useState<[number, number]>(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const from = fromParam ? paramToMonth(fromParam) : null;
    const to = toParam ? paramToMonth(toParam) : null;
    return [
      from !== null && from >= minMonth && from <= maxMonth ? from : minMonth,
      to !== null && to >= minMonth && to <= maxMonth ? to : maxMonth,
    ];
  });
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
  const selectedPolylinesRef = useRef<L.Polyline[]>([]);
  const polylinesByWorkIdRef = useRef<Map<number, L.Polyline[]>>(new Map());
  const polylineColorByWorkIdRef = useRef<Map<number, string>>(new Map());
  const cavePolygonsByCaveIdRef = useRef<Map<number, L.Polygon[]>>(new Map());
  const [displayedCave, setDisplayedCave] = useState<CaveData | null>(null);
  const displayedCaveRef = useRef<CaveData | null>(null);
  const selectedTypesRef = useRef<Set<string>>(new Set());
  const dateRangeRef = useRef<[number, number]>([minMonth, maxMonth]);
  const stackedWorksRef = useRef<WorkData[]>([]);
  const stackIndexRef = useRef(0);
  const pendingStackIndexRef = useRef<number | null>(null);
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

  const initialWorkId = searchParams.get("work");
  const initialWorkIdRef = useRef<number | null>(
    initialWorkId ? Number(initialWorkId) : null,
  );
  const initialCaveId = searchParams.get("cave");
  const initialCaveIdRef = useRef<number | null>(
    initialCaveId ? Number(initialCaveId) : null,
  );
  const initialLat = searchParams.get("lat");
  const initialLng = searchParams.get("lng");
  const initialZoom = searchParams.get("zoom");
  const initialViewRef = useRef<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(
    initialLat && initialLng && initialZoom
      ? {
          lat: Number(initialLat),
          lng: Number(initialLng),
          zoom: Number(initialZoom),
        }
      : null,
  );

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    const params = new URLSearchParams(window.location.search);

    const slugs = Array.from(selectedTypes)
      .map((name) => nameToSlug.get(name) ?? toSlug(name))
      .sort()
      .join(",");
    if (slugs) {
      params.set("type", slugs);
    } else {
      params.delete("type");
    }

    if (dateRange[0] !== minMonth || dateRange[1] !== maxMonth) {
      params.set("from", monthToParam(dateRange[0]));
      params.set("to", monthToParam(dateRange[1]));
    } else {
      params.delete("from");
      params.delete("to");
    }

    if (displayedWorkRef.current) {
      params.set("work", String(displayedWorkRef.current.work_id));
    } else {
      params.delete("work");
    }

    if (displayedCaveRef.current) {
      params.set("cave", String(displayedCaveRef.current.cave_id));
    } else {
      params.delete("cave");
    }

    const qs = params.toString().replace(/%2C/gi, ",");
    const currentQs = window.location.search.replace(/^\?/, "");
    if (qs === currentQs) return;
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [
    selectedTypes,
    nameToSlug,
    dateRange,
    minMonth,
    maxMonth,
    displayedWork,
    displayedCave,
  ]);

  const selectWork = useCallback((work: WorkData | null) => {
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    if (!displayedWorkRef.current) {
      displayedWorkRef.current = work;
      setDisplayedWork(work);
      if (pendingStackIndexRef.current !== null) {
        setStackIndex(pendingStackIndexRef.current);
        pendingStackIndexRef.current = null;
      }
    } else {
      nextWorkRef.current = work;
      setIsExiting(true);
      exitTimeoutRef.current = setTimeout(() => {
        displayedWorkRef.current = nextWorkRef.current;
        setDisplayedWork(nextWorkRef.current);
        setIsExiting(false);
        if (pendingStackIndexRef.current !== null) {
          setStackIndex(pendingStackIndexRef.current);
          pendingStackIndexRef.current = null;
        }
      }, exitDurationRef.current);
    }
  }, []);

  const resetSelectedPolylines = useCallback(() => {
    const selected = selectedPolylinesRef.current;
    // Find which workId owns these polylines to restore the correct color
    polylinesByWorkIdRef.current.forEach((polylines, workId) => {
      if (polylines.some((pl) => selected.includes(pl))) {
        const color =
          polylineColorByWorkIdRef.current.get(workId) ?? "rgb(113, 152, 185)";
        polylines.forEach((pl) => pl.setStyle({ color, opacity: 1 }));
      }
    });
    selectedPolylinesRef.current = [];
  }, []);

  const resetSelectedCavePolylines = useCallback(() => {
    if (displayedCaveRef.current) {
      const polygons =
        cavePolygonsByCaveIdRef.current.get(displayedCaveRef.current.cave_id) ??
        [];
      polygons.forEach((pl) =>
        pl.setStyle({
          color: "#2c2e2f",
          fillColor: "#2c2e2f",
          fillOpacity: 1,
          opacity: 1,
        }),
      );
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
    resetSelectedPolylines();
    if (displayedCaveRef.current) {
      resetSelectedCavePolylines();
      displayedCaveRef.current = null;
      setDisplayedCave(null);
    }
    stackedWorksRef.current = [];
    stackIndexRef.current = 0;
    setStackIndex(0);
    setStackTotal(0);
    selectWork(null);
  }, [selectWork, locale, resetSelectedPolylines, resetSelectedCavePolylines]);

  const handleNavigate = useCallback(
    (direction: 1 | -1) => {
      const stack = stackedWorksRef.current;
      if (stack.length <= 1) return;
      const newIndex =
        (stackIndexRef.current + direction + stack.length) % stack.length;
      stackIndexRef.current = newIndex;
      setAnimType(direction === 1 ? "slide-next" : "slide-prev");
      exitDurationRef.current = EXIT_DURATION_SLIDE;
      pendingStackIndexRef.current = newIndex;
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
        maxZoom: 19,
      },
    ).addTo(map);

    // Temporary Arras overlay for reference
    L.imageOverlay(
      "/images/map/arras-overlay.png",
      [
        [50.2674, 2.7229],
        [50.307, 2.8126],
      ],
      { opacity: 0 },
    ).addTo(map);

    // Draw tunnel polylines from work_path data
    const workIdsWithPaths = new Set(paths.map((p) => p.work_id));
    const polylinesByWorkId = new Map<number, L.Polyline[]>();
    const segments = new Map<
      string,
      { workId: number; points: [number, number][] }
    >();
    paths.forEach((p) => {
      const key = `${p.work_id}-${p.segment}`;
      if (!segments.has(key))
        segments.set(key, { workId: p.work_id, points: [] });
      segments.get(key)!.points.push([Number(p.latitude), Number(p.longitude)]);
    });
    segments.forEach(({ workId, points }) => {
      const work = works.find((w) => w.work_id === workId);
      const cat = work?.work_category_1_en ?? null;
      const workColor =
        cat && CATEGORY_COLORS[cat]
          ? CATEGORY_COLORS[cat]
          : "rgb(113, 152, 185)";
      polylineColorByWorkIdRef.current.set(workId, workColor);

      const polyline = L.polyline(points, {
        color: workColor,
        weight: 3,
        opacity: 1,
      }).addTo(map);
      if (!polylinesByWorkId.has(workId)) polylinesByWorkId.set(workId, []);
      polylinesByWorkId.get(workId)!.push(polyline);
      polylinesByWorkIdRef.current = polylinesByWorkId;

      if (work) {
        polyline.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          if (selectedMarkerRef.current) {
            const prev = stackedWorksRef.current;
            const prevCount = prev.length || 1;
            const prevCats = collectCategories(prev, locale);
            selectedMarkerRef.current.setIcon(
              createWorkIcon(prevCats, prevCount, typeColorsRef.current),
            );
            selectedMarkerRef.current = null;
          }
          // Reset previous polylines, then highlight all segments of this work
          resetSelectedPolylines();
          const workPolylines = polylinesByWorkId.get(workId) ?? [];
          workPolylines.forEach((pl) => {
            pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 });
          });
          selectedPolylinesRef.current = workPolylines;

          map.panTo(e.latlng);
          stackedWorksRef.current = [work];
          stackIndexRef.current = 0;
          setStackIndex(0);
          setStackTotal(1);
          setAnimType("fade");
          exitDurationRef.current = EXIT_DURATION_FADE;
          selectWork(work);
        });
      }
    });

    // Draw cave polygons
    const caveSegments = new Map<
      string,
      { caveId: number; points: [number, number][] }
    >();
    cavePaths.forEach((p) => {
      const key = `${p.cave_id}-${p.segment}`;
      if (!caveSegments.has(key))
        caveSegments.set(key, { caveId: p.cave_id, points: [] });
      caveSegments
        .get(key)!
        .points.push([Number(p.latitude), Number(p.longitude)]);
    });
    const cavePolygonsById = new Map<number, L.Polygon[]>();
    caveSegments.forEach(({ caveId, points }) => {
      const polygon = L.polygon(points, {
        color: "#2c2e2f",
        weight: 2,
        opacity: 1,
        fillColor: "#2c2e2f",
        fillOpacity: 1,
      }).addTo(map);
      if (!cavePolygonsById.has(caveId)) cavePolygonsById.set(caveId, []);
      cavePolygonsById.get(caveId)!.push(polygon);

      const cave = caves.find((c) => c.cave_id === caveId);
      if (cave) {
        polygon.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          // Reset any selected work marker or polylines
          if (selectedMarkerRef.current) {
            const prev = stackedWorksRef.current;
            const prevCount = prev.length || 1;
            const prevCats = collectCategories(prev, locale);
            selectedMarkerRef.current.setIcon(
              createWorkIcon(prevCats, prevCount, typeColorsRef.current),
            );
            selectedMarkerRef.current = null;
          }
          resetSelectedPolylines();
          stackedWorksRef.current = [];
          selectWork(null);
          // Reset previous cave polygons
          if (displayedCaveRef.current) {
            const prevCavePolygons =
              cavePolygonsById.get(displayedCaveRef.current.cave_id) ?? [];
            prevCavePolygons.forEach((pl) =>
              pl.setStyle({
                color: "#2c2e2f",
                fillColor: "#2c2e2f",
                fillOpacity: 1,
                opacity: 1,
              }),
            );
          }
          // Highlight all segments of this cave
          const thisCavePolygons = cavePolygonsById.get(caveId) ?? [];
          thisCavePolygons.forEach((pl) =>
            pl.setStyle({
              color: MARKER_COLOR_ACTIVE,
              fillColor: "#2c2e2f",
              fillOpacity: 1,
              opacity: 1,
            }),
          );
          displayedCaveRef.current = cave;
          setDisplayedCave(cave);
          map.panTo(e.latlng);
        });
      }
    });
    cavePolygonsByCaveIdRef.current = cavePolygonsById;

    // Group works by location using a Map keyed by snapped coordinates (O(n))
    const snapCoord = (n: number) =>
      Math.round(n / COORD_TOLERANCE) * COORD_TOLERANCE;
    const groupMap = new Map<string, WorkData[]>();
    works.forEach((work) => {
      if (workIdsWithPaths.has(work.work_id)) return;
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
          // Reset any highlighted polylines
          resetSelectedPolylines();
          // Reset any highlighted cave
          if (displayedCaveRef.current) {
            const prevCavePolygons =
              cavePolygonsByCaveIdRef.current.get(
                displayedCaveRef.current.cave_id,
              ) ?? [];
            prevCavePolygons.forEach((pl) =>
              pl.setStyle({
                color: "#2c2e2f",
                fillColor: "#2c2e2f",
                fillOpacity: 1,
                opacity: 1,
              }),
            );
            displayedCaveRef.current = null;
            setDisplayedCave(null);
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

    map.on("click", (e: L.LeafletMouseEvent) => {
      // eslint-disable-next-line no-console
      console.log(`[${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}],`);
      closeInfo();
    });

    const savedView = initialViewRef.current;
    if (savedView) {
      map.setView([savedView.lat, savedView.lng], savedView.zoom);
    } else {
      const bounds = L.latLngBounds(
        works.map(
          (w) => [w.work_latitude, w.work_longitude] as [number, number],
        ),
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    map.on("moveend", () => {
      const center = map.getCenter();
      const z = map.getZoom();
      const params = new URLSearchParams(window.location.search);
      params.set("lat", center.lat.toFixed(6));
      params.set("lng", center.lng.toFixed(6));
      params.set("zoom", String(z));
      const qs = params.toString().replace(/%2C/gi, ",");
      const currentQs = window.location.search.replace(/^\?/, "");
      if (qs === currentQs) return;
      const url = `${window.location.pathname}?${qs}`;
      window.history.replaceState(null, "", url);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [
    works,
    paths,
    caves,
    cavePaths,
    locale,
    allMonths,
    selectWork,
    closeInfo,
    resetSelectedPolylines,
  ]);

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
    // Filter polylines by date range and selected types
    polylinesByWorkIdRef.current.forEach((polylines, workId) => {
      const work = works.find((w) => w.work_id === workId);
      if (!work) return;
      const idx = works.indexOf(work);
      const [c1, c2] = getWorkCategories(work, locale);
      const visible = isWorkVisible(
        allMonths[idx].start,
        allMonths[idx].end,
        c1,
        c2,
        dateRange,
        selectedTypes,
      );
      polylines.forEach((pl) => {
        if (visible) {
          if (!map.hasLayer(pl)) pl.addTo(map);
        } else {
          if (map.hasLayer(pl)) pl.remove();
        }
      });
    });
  }, [dateRange, selectedTypes, typeColors, works, locale, allMonths]);

  const prevSelectedTypesRef = useRef(selectedTypes);
  useEffect(() => {
    if (prevSelectedTypesRef.current === selectedTypes) return;
    prevSelectedTypesRef.current = selectedTypes;
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

  // Open work/cave from URL param — must run after all other effects
  useEffect(() => {
    const timer = setTimeout(() => {
      // Restore cave
      const initialCaveId = initialCaveIdRef.current;
      if (initialCaveId !== null) {
        initialCaveIdRef.current = null;
        const cave = caves.find((c) => c.cave_id === initialCaveId);
        const polygons =
          cavePolygonsByCaveIdRef.current.get(initialCaveId) ?? [];
        if (cave && polygons.length > 0) {
          polygons.forEach((pl) =>
            pl.setStyle({
              color: MARKER_COLOR_ACTIVE,
              fillColor: "#2c2e2f",
              fillOpacity: 1,
              opacity: 1,
            }),
          );
          displayedCaveRef.current = cave;
          setDisplayedCave(cave);
        }
        return;
      }
      // Restore work (marker or polyline)
      const initialWorkId = initialWorkIdRef.current;
      if (initialWorkId === null || !mapRef.current) return;
      initialWorkIdRef.current = null;
      // Try marker first
      const entry = markersRef.current.find(({ groupWorks }) =>
        groupWorks.some((w) => w.work_id === initialWorkId),
      );
      if (entry) {
        entry.marker.fire("click");
        return;
      }
      // Try polyline
      const polylines = polylinesByWorkIdRef.current.get(initialWorkId) ?? [];
      const work = works.find((w) => w.work_id === initialWorkId);
      if (work && polylines.length > 0) {
        polylines.forEach((pl) =>
          pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 }),
        );
        selectedPolylinesRef.current = polylines;
        stackedWorksRef.current = [work];
        stackIndexRef.current = 0;
        setStackIndex(0);
        setStackTotal(1);
        setAnimType("fade");
        exitDurationRef.current = EXIT_DURATION_FADE;
        selectWork(work);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [caves, works, selectWork]);

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
        {(displayedWork || displayedCave) && (
          <InfoBar
            work={displayedWork}
            cave={displayedCave}
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

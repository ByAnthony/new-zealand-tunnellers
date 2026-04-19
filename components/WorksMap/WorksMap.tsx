"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { CaveData, CavePathPoint } from "@/utils/database/queries/cavesQuery";
import {
  FrontLineData,
  FrontLinePathPoint,
} from "@/utils/database/queries/frontLinesQuery";
import {
  SubwayData,
  SubwayPathPoint,
} from "@/utils/database/queries/subwaysQuery";
import { WorkData, WorkPathPoint } from "@/utils/database/queries/worksQuery";

import { InfoBar } from "./InfoBar/InfoBar";
import { MapControls } from "./MapControls/MapControls";
import {
  collectCategories,
  getVisibleFrontLines,
  getWorkCategories,
  isWorkVisible,
} from "./utils/filterUtils";
import { dateToDay, dayToParam, paramToDay, toSlug } from "./utils/mapParams";
import {
  CATEGORY_COLORS,
  MARKER_COLOR_ACTIVE,
  createGroupIcon,
  createSingleIcon,
  createWorkIcon,
} from "./utils/markerIcons";
import { groupPathsBySegment } from "./utils/pathUtils";
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
  paths: WorkPathPoint[];
  caves: CaveData[];
  cavePaths: CavePathPoint[];
  subways: SubwayData[];
  subwayPaths: SubwayPathPoint[];
  frontLines: FrontLineData[];
  frontLinePaths: FrontLinePathPoint[];
  locale: string;
};

const COORD_TOLERANCE = 0.0001;
const EXIT_DURATION_DEFAULT = 150;
const EXIT_DURATION_SLIDE = 250;
const EXIT_DURATION_FADE = 300;
const CAVE_COLOR = "rgb(44, 46, 47)";
const CAVE_BORDER_COLOR = "rgba(255,255,255,0.15)";
const DEFAULT_WORK_COLOR = "rgb(113, 152, 185)";
const BRITISH_LINE_COLOR = "rgb(80, 120, 180)";
const GERMAN_LINE_COLOR = "rgb(180, 70, 70)";

export function WorksMap({
  works,
  paths,
  caves,
  cavePaths,
  subways,
  subwayPaths,
  frontLines,
  frontLinePaths,
  locale,
}: Props) {
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
        start: dateToDay(w.work_date_start!),
        end: dateToDay(w.work_date_end || w.work_date_start!),
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

  const isPeriodParam = searchParams.get("period") === "true";
  const isFrontLinesParam = searchParams.get("frontlines") === "true";
  const initialPeriodKey = (() => {
    if (!isPeriodParam) return null;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    return fromParam && toParam ? `${fromParam}/${toParam}` : null;
  })();
  const [activePeriodKey, setActivePeriodKey] = useState<string | null>(
    () => initialPeriodKey,
  );
  const periodKeyRef = useRef<string | null>(initialPeriodKey);
  const isPeriodActive = activePeriodKey !== null;
  const [showFrontLines, setShowFrontLines] = useState(
    () => isFrontLinesParam || initialPeriodKey !== null,
  );
  const periodBounds = useMemo<[number, number] | null>(() => {
    if (!activePeriodKey) return null;
    const [start, end] = activePeriodKey.split("/");
    if (!start || !end) return null;
    return [dateToDay(start), dateToDay(end)];
  }, [activePeriodKey]);

  const [dateRange, setDateRange] = useState<[number, number]>(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const from = fromParam ? paramToDay(fromParam) : null;
    const to = toParam ? paramToDay(toParam) : null;
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
  const frontLinePolylinesByIdRef = useRef<Map<number, L.Polyline[]>>(
    new Map(),
  );
  const subwayPolylinesBySubwayIdRef = useRef<Map<number, L.Polyline[]>>(
    new Map(),
  );
  const [displayedSubway, setDisplayedSubway] = useState<SubwayData | null>(
    null,
  );
  const displayedSubwayRef = useRef<SubwayData | null>(null);
  const selectedTypesRef = useRef<Set<string>>(new Set());
  const dateRangeRef = useRef<[number, number]>([minMonth, maxMonth]);
  const stackedWorksRef = useRef<WorkData[]>([]);
  const stackIndexRef = useRef(0);
  const pendingStackIndexRef = useRef<number | null>(null);
  const pendingFilterFitRef = useRef(false);
  const [stackIndex, setStackIndex] = useState(0);
  const [stackTotal, setStackTotal] = useState(0);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [animType, setAnimType] = useState<
    "default" | "fade" | "slide-next" | "slide-prev"
  >("default");
  const exitDurationRef = useRef(EXIT_DURATION_DEFAULT);

  const typeColorsRef = useRef(typeColors);

  useEffect(() => {
    selectedTypesRef.current = selectedTypes;
    dateRangeRef.current = dateRange;
    typeColorsRef.current = typeColors;
  }, [selectedTypes, dateRange, typeColors]);

  const initialWorkId = searchParams.get("work");
  const initialWorkIdRef = useRef<number | null>(
    initialWorkId ? Number(initialWorkId) : null,
  );
  const initialCaveId = searchParams.get("cave");
  const initialCaveIdRef = useRef<number | null>(
    initialCaveId ? Number(initialCaveId) : null,
  );
  const initialSubwayId = searchParams.get("subway");
  const initialSubwayIdRef = useRef<number | null>(
    initialSubwayId ? Number(initialSubwayId) : null,
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

    if (isPeriodActive) {
      params.set("period", "true");
    } else {
      params.delete("period");
    }

    if (showFrontLines) {
      params.set("frontlines", "true");
    } else {
      params.delete("frontlines");
    }

    if (dateRange[0] !== minMonth || dateRange[1] !== maxMonth) {
      params.set("from", dayToParam(dateRange[0]));
      params.set("to", dayToParam(dateRange[1]));
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

    if (displayedSubwayRef.current) {
      params.set("subway", String(displayedSubwayRef.current.subway_id));
    } else {
      params.delete("subway");
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
    isPeriodActive,
    showFrontLines,
    displayedWork,
    displayedCave,
    displayedSubway,
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
          polylineColorByWorkIdRef.current.get(workId) ?? DEFAULT_WORK_COLOR;
        polylines.forEach((pl) => pl.setStyle({ color, opacity: 1 }));
      }
    });
    selectedPolylinesRef.current = [];
  }, []);

  const resetSelectedSubwayPolylines = useCallback(() => {
    if (displayedSubwayRef.current) {
      const polylines =
        subwayPolylinesBySubwayIdRef.current.get(
          displayedSubwayRef.current.subway_id,
        ) ?? [];
      polylines.forEach((pl) => pl.setStyle({ color: CAVE_COLOR, opacity: 1 }));
    }
  }, []);

  const resetSelectedCavePolylines = useCallback(() => {
    if (displayedCaveRef.current) {
      const polygons =
        cavePolygonsByCaveIdRef.current.get(displayedCaveRef.current.cave_id) ??
        [];
      polygons.forEach((pl) =>
        pl.setStyle({
          color: CAVE_BORDER_COLOR,
          fillColor: CAVE_COLOR,
          fillOpacity: 1,
          opacity: 1,
        }),
      );
    }
  }, []);

  const fitToVisibleWorks = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const points = markersRef.current
      .filter(({ marker }) => map.hasLayer(marker))
      .map(({ marker }) => marker.getLatLng());
    let bounds = points.length > 0 ? L.latLngBounds(points) : null;
    const extendWithPolylineBounds = (polylines: L.Polyline[]) => {
      polylines.forEach((pl) => {
        if (!map.hasLayer(pl)) return;
        const plBounds = pl.getBounds();
        if (!plBounds.isValid()) return;
        bounds = bounds ? bounds.extend(plBounds) : plBounds;
      });
    };
    polylinesByWorkIdRef.current.forEach((polylines) => {
      extendWithPolylineBounds(polylines);
    });
    const { visibleIds } = getVisibleFrontLines(
      frontLines,
      dateRange,
      showFrontLines,
      dateToDay,
    );
    visibleIds.forEach((id) => {
      const polylines = frontLinePolylinesByIdRef.current.get(id) ?? [];
      extendWithPolylineBounds(polylines);
    });
    if (!bounds || !bounds.isValid()) return;
    map.fitBounds(bounds, {
      padding: [30, 30],
    });
  }, [frontLines, dateRange, showFrontLines]);

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
    if (displayedSubwayRef.current) {
      resetSelectedSubwayPolylines();
      displayedSubwayRef.current = null;
      setDisplayedSubway(null);
    }
    stackedWorksRef.current = [];
    stackIndexRef.current = 0;
    setStackIndex(0);
    setStackTotal(0);
    selectWork(null);
  }, [
    selectWork,
    locale,
    resetSelectedPolylines,
    resetSelectedCavePolylines,
    resetSelectedSubwayPolylines,
  ]);

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

    const map = L.map(containerRef.current, { zoomControl: false, minZoom: 6 });

    const frontLinePane = map.createPane("frontLinePane");
    frontLinePane.style.zIndex = "450";

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    const initializeStack = (stackWorks: WorkData[]) => {
      stackedWorksRef.current = stackWorks;
      stackIndexRef.current = 0;
      setStackIndex(0);
      setStackTotal(stackWorks.length);
      setAnimType("fade");
      exitDurationRef.current = EXIT_DURATION_FADE;
      selectWork(stackWorks[0]);
    };

    const panTo = (latlng: L.LatLng) => {
      if (window.innerWidth < 512) {
        const pt = map.latLngToContainerPoint(latlng);
        map.panTo(map.containerPointToLatLng(L.point(pt.x, pt.y + 100)));
      } else {
        map.panTo(latlng);
      }
    };

    const workIdsWithPaths = new Set(paths.map((p) => p.work_id));
    const polylinesByWorkId = new Map<number, L.Polyline[]>();
    const segments = groupPathsBySegment(paths, (p) => p.work_id);
    segments.forEach(({ id: workId, points }) => {
      const work = works.find((w) => w.work_id === workId);
      const cat = work?.work_category_1_en ?? null;
      const workColor =
        cat && CATEGORY_COLORS[cat] ? CATEGORY_COLORS[cat] : DEFAULT_WORK_COLOR;
      polylineColorByWorkIdRef.current.set(workId, workColor);

      const polyline = L.polyline(points, {
        color: workColor,
        weight: 3,
        opacity: 1,
      }).addTo(map);
      if (!polylinesByWorkId.has(workId)) polylinesByWorkId.set(workId, []);
      polylinesByWorkId.get(workId)!.push(polyline);

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
          resetSelectedPolylines();
          if (displayedCaveRef.current) {
            resetSelectedCavePolylines();
            displayedCaveRef.current = null;
            setDisplayedCave(null);
          }
          if (displayedSubwayRef.current) {
            resetSelectedSubwayPolylines();
            displayedSubwayRef.current = null;
            setDisplayedSubway(null);
          }
          const workPolylines = polylinesByWorkId.get(workId) ?? [];
          workPolylines.forEach((pl) => {
            pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 });
          });
          selectedPolylinesRef.current = workPolylines;

          panTo(e.latlng);
          initializeStack([work]);
        });
      }
    });
    polylinesByWorkIdRef.current = polylinesByWorkId;

    const cavePolygonsById = new Map<number, L.Polygon[]>();
    groupPathsBySegment(cavePaths, (p) => p.cave_id).forEach(
      ({ id: caveId, points }) => {
        const polygon = L.polygon(points, {
          color: CAVE_BORDER_COLOR,
          weight: 2,
          opacity: 1,
          fillColor: CAVE_COLOR,
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
            if (displayedSubwayRef.current) {
              resetSelectedSubwayPolylines();
              displayedSubwayRef.current = null;
              setDisplayedSubway(null);
            }
            if (displayedCaveRef.current) {
              resetSelectedCavePolylines();
            }
            const thisCavePolygons = cavePolygonsById.get(caveId) ?? [];
            thisCavePolygons.forEach((pl) =>
              pl.setStyle({
                color: MARKER_COLOR_ACTIVE,
                fillColor: MARKER_COLOR_ACTIVE,
                fillOpacity: 1,
                opacity: 1,
              }),
            );
            displayedCaveRef.current = cave;
            setDisplayedCave(cave);
            panTo(e.latlng);
          });
        }
      },
    );
    cavePolygonsByCaveIdRef.current = cavePolygonsById;

    const subwayPolylinesById = new Map<number, L.Polyline[]>();
    groupPathsBySegment(subwayPaths, (p) => p.subway_id).forEach(
      ({ id: subwayId, points }) => {
        const polyline = L.polyline(points, {
          color: CAVE_COLOR,
          weight: 3,
          opacity: 1,
        }).addTo(map);
        if (!subwayPolylinesById.has(subwayId))
          subwayPolylinesById.set(subwayId, []);
        subwayPolylinesById.get(subwayId)!.push(polyline);

        const subway = subways.find((s) => s.subway_id === subwayId);
        if (subway) {
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
            resetSelectedPolylines();
            stackedWorksRef.current = [];
            selectWork(null);
            if (displayedCaveRef.current) {
              resetSelectedCavePolylines();
              displayedCaveRef.current = null;
              setDisplayedCave(null);
            }
            if (displayedSubwayRef.current) {
              resetSelectedSubwayPolylines();
            }
            const thisSubwayPolylines = subwayPolylinesById.get(subwayId) ?? [];
            thisSubwayPolylines.forEach((pl) =>
              pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 }),
            );
            displayedSubwayRef.current = subway;
            setDisplayedSubway(subway);
            panTo(e.latlng);
          });
        }
      },
    );
    subwayPolylinesBySubwayIdRef.current = subwayPolylinesById;

    // Draw front lines
    const frontLinePolylinesById = new Map<number, L.Polyline[]>();
    groupPathsBySegment(frontLinePaths, (p) => p.front_line_id).forEach(
      ({ id: frontLineId, points }) => {
        const fl = frontLines.find((f) => f.front_line_id === frontLineId);
        if (!fl) return;
        const color =
          fl.front_line_side === "british"
            ? BRITISH_LINE_COLOR
            : GERMAN_LINE_COLOR;
        const polyline = L.polyline(points, {
          color,
          weight: 2,
          opacity: 0,
          pane: "frontLinePane",
          interactive: false,
        }).addTo(map);
        if (!frontLinePolylinesById.has(frontLineId))
          frontLinePolylinesById.set(frontLineId, []);
        frontLinePolylinesById.get(frontLineId)!.push(polyline);
      },
    );
    frontLinePolylinesByIdRef.current = frontLinePolylinesById;

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
          resetSelectedPolylines();
          if (displayedCaveRef.current) {
            resetSelectedCavePolylines();
            displayedCaveRef.current = null;
            setDisplayedCave(null);
          }
          if (displayedSubwayRef.current) {
            resetSelectedSubwayPolylines();
            displayedSubwayRef.current = null;
            setDisplayedSubway(null);
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
          panTo(marker.getLatLng());
          initializeStack(filtered);
        });

      const worksMonths = groupWorks.map((w) => {
        const idx = works.indexOf(w);
        return { start: allMonths[idx].start, end: allMonths[idx].end };
      });

      const categoryPairs = groupWorks.map((w) => getWorkCategories(w, locale));
      return {
        marker,
        groupWorks,
        starts: worksMonths.map((m) => m.start),
        ends: worksMonths.map((m) => m.end),
        categories1: categoryPairs.map(([c1]) => c1),
        categories2: categoryPairs.map(([, c2]) => c2),
      };
    });

    map.on("click", () => {
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
      setCurrentZoom(z);
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

    map.on("load", () => setCurrentZoom(map.getZoom()));
    setCurrentZoom(map.getZoom());

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
    subways,
    subwayPaths,
    locale,
    allMonths,
    selectWork,
    closeInfo,
    resetSelectedPolylines,
    resetSelectedCavePolylines,
    resetSelectedSubwayPolylines,
    frontLines,
    frontLinePaths,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const toggleLayer = (layer: L.Layer, visible: boolean) => {
      if (visible) {
        if (!map.hasLayer(layer)) layer.addTo(map);
      } else {
        if (map.hasLayer(layer)) layer.remove();
      }
    };
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
        toggleLayer(marker, count > 0);
        if (count > 0 && marker !== selectedMarkerRef.current) {
          marker.setIcon(createWorkIcon(visibleCats, count, typeColors));
        }
      },
    );
    polylinesByWorkIdRef.current.forEach((polylines, workId) => {
      const idx = works.findIndex((w) => w.work_id === workId);
      if (idx === -1) return;
      const work = works[idx];
      const [c1, c2] = getWorkCategories(work, locale);
      const visible = isWorkVisible(
        allMonths[idx].start,
        allMonths[idx].end,
        c1,
        c2,
        dateRange,
        selectedTypes,
      );
      polylines.forEach((pl) => toggleLayer(pl, visible));
    });
    const filterActive = selectedTypes.size > 0;
    const subwayTypeSelected = selectedTypes.has(
      slugToName.get("subway") ?? "",
    );
    subwayPolylinesBySubwayIdRef.current.forEach((polylines, subwayId) => {
      const subway = subways.find((s) => s.subway_id === subwayId);
      if (!subway) return;
      let visible = !filterActive || subwayTypeSelected;
      if (visible && subway.subway_date_start) {
        const start = dateToDay(subway.subway_date_start);
        const end = dateToDay(
          subway.subway_date_end ?? subway.subway_date_start,
        );
        visible = start <= dateRange[1] && end >= dateRange[0];
      }
      polylines.forEach((pl) => toggleLayer(pl, visible));
    });
    cavePolygonsByCaveIdRef.current.forEach((polygons) => {
      polygons.forEach((pl) =>
        toggleLayer(pl, !filterActive || subwayTypeSelected),
      );
    });
    const { visibleIds, latestIds } = getVisibleFrontLines(
      frontLines,
      dateRange,
      showFrontLines,
      dateToDay,
    );

    frontLinePolylinesByIdRef.current.forEach((polylines, id) => {
      const visible = visibleIds.has(id);
      const isOld = visible && !latestIds.has(id);
      polylines.forEach((pl) => {
        if (visible) {
          pl.setStyle({
            opacity: 1,
            dashArray: isOld ? "6 6" : undefined,
          });
          if (!mapRef.current?.hasLayer(pl)) pl.addTo(mapRef.current!);
        } else {
          pl.setStyle({ opacity: 0, dashArray: undefined });
        }
      });
    });
  }, [
    dateRange,
    selectedTypes,
    slugToName,
    typeColors,
    works,
    locale,
    allMonths,
    subways,
    frontLines,
    minMonth,
    maxMonth,
    showFrontLines,
  ]);

  useEffect(() => {
    if (!pendingFilterFitRef.current) return;
    pendingFilterFitRef.current = false;
    fitToVisibleWorks();
  }, [dateRange, selectedTypes, showFrontLines, fitToVisibleWorks]);

  const prevSelectedTypesRef = useRef(selectedTypes);
  useEffect(() => {
    if (prevSelectedTypesRef.current === selectedTypes) return;
    prevSelectedTypesRef.current = selectedTypes;
    fitToVisibleWorks();
  }, [selectedTypes, fitToVisibleWorks]);

  const isDisplayedWorkVisible = useCallback(
    (work: WorkData | null): boolean => {
      if (!work) return false;
      const idx = works.findIndex((w) => w.work_id === work.work_id);
      if (idx === -1) return false;
      const [c1, c2] = getWorkCategories(work, locale);
      return isWorkVisible(
        allMonths[idx].start,
        allMonths[idx].end,
        c1,
        c2,
        dateRange,
        selectedTypes,
      );
    },
    [works, locale, allMonths, dateRange, selectedTypes],
  );

  const isDisplayedSubwayVisible = useCallback(
    (subway: SubwayData | null): boolean => {
      if (!subway) return false;
      const filterActive = selectedTypes.size > 0;
      const subwayTypeSelected = selectedTypes.has(
        slugToName.get("subway") ?? "",
      );
      let visible = !filterActive || subwayTypeSelected;
      if (visible && subway.subway_date_start) {
        const start = dateToDay(subway.subway_date_start);
        const end = dateToDay(
          subway.subway_date_end ?? subway.subway_date_start,
        );
        visible = start <= dateRange[1] && end >= dateRange[0];
      }
      return visible;
    },
    [dateRange, selectedTypes, slugToName],
  );

  const isDisplayedCaveVisible = useCallback(
    (cave: CaveData | null): boolean => {
      if (!cave) return false;
      const filterActive = selectedTypes.size > 0;
      const subwayTypeSelected = selectedTypes.has(
        slugToName.get("subway") ?? "",
      );
      return !filterActive || subwayTypeSelected;
    },
    [selectedTypes, slugToName],
  );

  useEffect(() => {
    const hasInvalidSelection =
      (displayedWork !== null && !isDisplayedWorkVisible(displayedWork)) ||
      (displayedSubway !== null &&
        !isDisplayedSubwayVisible(displayedSubway)) ||
      (displayedCave !== null && !isDisplayedCaveVisible(displayedCave));
    if (!hasInvalidSelection) return;

    const timeoutId = setTimeout(() => {
      closeInfo();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    displayedWork,
    displayedSubway,
    displayedCave,
    isDisplayedWorkVisible,
    isDisplayedSubwayVisible,
    isDisplayedCaveVisible,
    closeInfo,
  ]);

  // Open work/cave from URL param — must run after all other effects
  useEffect(() => {
    const timer = setTimeout(() => {
      // Restore subway
      const initialSubwayId = initialSubwayIdRef.current;
      if (initialSubwayId !== null) {
        initialSubwayIdRef.current = null;
        const subway = subways.find((s) => s.subway_id === initialSubwayId);
        const polylines =
          subwayPolylinesBySubwayIdRef.current.get(initialSubwayId) ?? [];
        if (
          subway &&
          polylines.length > 0 &&
          isDisplayedSubwayVisible(subway)
        ) {
          polylines.forEach((pl) =>
            pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 }),
          );
          displayedSubwayRef.current = subway;
          setDisplayedSubway(subway);
        }
        return;
      }
      // Restore cave
      const initialCaveId = initialCaveIdRef.current;
      if (initialCaveId !== null) {
        initialCaveIdRef.current = null;
        const cave = caves.find((c) => c.cave_id === initialCaveId);
        const polygons =
          cavePolygonsByCaveIdRef.current.get(initialCaveId) ?? [];
        if (cave && polygons.length > 0 && isDisplayedCaveVisible(cave)) {
          polygons.forEach((pl) =>
            pl.setStyle({
              color: MARKER_COLOR_ACTIVE,
              fillColor: MARKER_COLOR_ACTIVE,
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
      if (work && polylines.length > 0 && isDisplayedWorkVisible(work)) {
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
  }, [
    subways,
    caves,
    works,
    selectWork,
    isDisplayedWorkVisible,
    isDisplayedSubwayVisible,
    isDisplayedCaveVisible,
  ]);

  const computeVisibleCount = useCallback(
    (start: number, end: number, types: Set<string>): number =>
      works.filter((w, i) => {
        const [cat1, cat2] = getWorkCategories(w, locale);
        return isWorkVisible(
          allMonths[i].start,
          allMonths[i].end,
          cat1,
          cat2,
          [start, end],
          types,
        );
      }).length,
    [works, allMonths, locale],
  );

  const visibleCount = computeVisibleCount(
    dateRange[0],
    dateRange[1],
    selectedTypes,
  );

  const computeAvailableTypes = useCallback(
    (start: number, end: number): Set<string> => {
      const cats = new Set<string>();
      works.forEach((w, i) => {
        if (allMonths[i].start <= end && allMonths[i].end >= start) {
          const [c1, c2] = getWorkCategories(w, locale);
          if (c1) cats.add(c1);
          if (c2) cats.add(c2);
        }
      });
      return cats;
    },
    [works, allMonths, locale],
  );

  const handleApplyFilters = useCallback(
    (
      periodKey: string | null,
      periodStart: string | null,
      periodEnd: string | null,
      types: Set<string>,
    ) => {
      closeInfo();
      periodKeyRef.current = periodKey;
      setActivePeriodKey(periodKey);
      setShowFrontLines(periodKey !== null);
      if (periodKey === null) {
        setDateRange([minMonth, maxMonth]);
      } else {
        const pMin = dateToDay(periodStart!);
        const pMax = dateToDay(periodEnd!);
        setDateRange([pMin, pMax]);
      }
      setSelectedTypes(types);
      pendingFilterFitRef.current = true;
    },
    [closeInfo, minMonth, maxMonth],
  );

  const zoom = useCallback((dir: 1 | -1) => {
    mapRef.current?.[dir === 1 ? "zoomIn" : "zoomOut"]();
  }, []);

  return (
    <div className={STYLES.container}>
      <div ref={containerRef} className={STYLES.map} />
      <div className={STYLES["map-controls"]}>
        {(displayedWork || displayedCave || displayedSubway) && (
          <InfoBar
            work={displayedWork}
            cave={displayedCave}
            subway={displayedSubway}
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
        <MapControls
          visibleCount={visibleCount}
          locale={locale}
          types={types}
          selectedTypes={selectedTypes}
          typeColors={typeColors}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onDateRangeComplete={fitToVisibleWorks}
          minMonth={minMonth}
          maxMonth={maxMonth}
          initialPeriodKey={initialPeriodKey}
          periodBounds={periodBounds}
          onApplyFilters={handleApplyFilters}
          computeAvailableTypes={computeAvailableTypes}
          computeVisibleCount={computeVisibleCount}
          currentZoom={currentZoom}
          onZoom={zoom}
          totalWorks={works.length}
        />
      </div>
    </div>
  );
}

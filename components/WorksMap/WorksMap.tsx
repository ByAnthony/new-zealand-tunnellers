"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

import { useWorksMapDerivedState } from "./hooks/useWorksMapDerivedState";
import { useWorksMapSelectionState } from "./hooks/useWorksMapSelectionState";
import { useWorksMapUrlState } from "./hooks/useWorksMapUrlState";
import { InfoBar } from "./InfoBar/InfoBar";
import { MapControls } from "./MapControls/MapControls";
import {
  collectCategories,
  getWorkCategories,
  isWorkVisible,
} from "./utils/filterUtils";
import {
  buildCavePolygonLayers,
  buildFrontLineLayers,
  buildPointWorkMarkers,
  buildSubwayPolylineLayers,
  buildWorkPolylineLayers,
} from "./utils/layerBuilders";
import { dateToDay, toSlug } from "./utils/mapParams";
import {
  CATEGORY_COLORS,
  MARKER_COLOR_ACTIVE,
  createWorkIcon,
} from "./utils/markerIcons";
import { MAP_PERIODS } from "./utils/periods";
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
  const periodDays = useMemo(
    () =>
      MAP_PERIODS.flatMap((period) => [
        dateToDay(period.start),
        dateToDay(period.end),
      ]),
    [],
  );
  const minMonth = Math.min(...allMonths.map((m) => m.start), ...periodDays);
  const maxMonth = Math.max(...allMonths.map((m) => m.end), ...periodDays);

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

  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const selectedPolylinesRef = useRef<L.Polyline[]>([]);
  const polylinesByWorkIdRef = useRef<Map<number, L.Polyline[]>>(new Map());
  const polylineColorByWorkIdRef = useRef<Map<number, string>>(new Map());
  const cavePolygonsByCaveIdRef = useRef<Map<number, L.Polygon[]>>(new Map());
  const frontLinePolylinesByIdRef = useRef<Map<number, L.Polyline[]>>(
    new Map(),
  );
  const subwayPolylinesBySubwayIdRef = useRef<Map<number, L.Polyline[]>>(
    new Map(),
  );
  const selectedTypesRef = useRef<Set<string>>(new Set());
  const dateRangeRef = useRef<[number, number]>([minMonth, maxMonth]);
  const pendingFilterFitRef = useRef(false);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const {
    displayedWork,
    displayedWorkRef,
    displayedCave,
    displayedCaveRef,
    displayedSubway,
    displayedSubwayRef,
    isExiting,
    stackIndex,
    stackTotal,
    animType,
    stackedWorksRef,
    showWorkStack,
    showSingleWork,
    navigateWorkStack,
    clearWorkSelection,
    setDisplayedCaveSelection,
    setDisplayedSubwaySelection,
  } = useWorksMapSelectionState();

  const {
    initialPeriodKey,
    activePeriodKey,
    setActivePeriodKey,
    showFrontLines,
    setShowFrontLines,
    periodBounds,
    dateRange,
    setDateRange,
    selectedTypes,
    setSelectedTypes,
    initialWorkIdRef,
    initialCaveIdRef,
    initialSubwayIdRef,
    initialViewRef,
  } = useWorksMapUrlState({
    minMonth,
    maxMonth,
    slugToName,
    nameToSlug,
    displayedWork,
    displayedWorkRef,
    displayedCave,
    displayedCaveRef,
    displayedSubway,
    displayedSubwayRef,
  });
  const typeColorsRef = useRef(typeColors);

  useEffect(() => {
    selectedTypesRef.current = selectedTypes;
    dateRangeRef.current = dateRange;
    typeColorsRef.current = typeColors;
  }, [selectedTypes, dateRange, typeColors]);

  const {
    visibleFrontLineState,
    isDisplayedWorkVisible,
    isDisplayedSubwayVisible,
    isDisplayedCaveVisible,
    visibleSubwayIds,
    cavesVisible,
    visibleCount,
    computeVisibleCount,
    computeAvailableTypes,
    computeTypeBounds,
    clampBounds,
  } = useWorksMapDerivedState({
    works,
    subways,
    frontLines,
    locale,
    allMonths,
    dateRange,
    selectedTypes,
    slugToName,
    periodBounds,
    showFrontLines,
  });

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
  }, [displayedSubwayRef]);

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
  }, [displayedCaveRef]);

  const resetSelectedMarker = useCallback(() => {
    if (!selectedMarkerRef.current) return;

    const stack = stackedWorksRef.current;
    const count = stack.length || 1;
    const cats = collectCategories(stack, locale);
    selectedMarkerRef.current.setIcon(
      createWorkIcon(cats, count, typeColorsRef.current),
    );
    selectedMarkerRef.current = null;
  }, [locale, stackedWorksRef]);

  const clearCaveSelection = useCallback(
    (clearState: boolean) => {
      if (!displayedCaveRef.current) return;
      resetSelectedCavePolylines();
      if (clearState) setDisplayedCaveSelection(null);
    },
    [displayedCaveRef, resetSelectedCavePolylines, setDisplayedCaveSelection],
  );

  const clearSubwaySelection = useCallback(
    (clearState: boolean) => {
      if (!displayedSubwayRef.current) return;
      resetSelectedSubwayPolylines();
      if (clearState) setDisplayedSubwaySelection(null);
    },
    [
      displayedSubwayRef,
      resetSelectedSubwayPolylines,
      setDisplayedSubwaySelection,
    ],
  );

  const prepareForWorkSelection = useCallback(() => {
    resetSelectedMarker();
    resetSelectedPolylines();
    clearCaveSelection(true);
    clearSubwaySelection(true);
  }, [
    resetSelectedMarker,
    resetSelectedPolylines,
    clearCaveSelection,
    clearSubwaySelection,
  ]);

  const prepareForCaveSelection = useCallback(() => {
    resetSelectedMarker();
    resetSelectedPolylines();
    clearWorkSelection();
    clearSubwaySelection(true);
    clearCaveSelection(false);
  }, [
    resetSelectedMarker,
    resetSelectedPolylines,
    clearWorkSelection,
    clearSubwaySelection,
    clearCaveSelection,
  ]);

  const prepareForSubwaySelection = useCallback(() => {
    resetSelectedMarker();
    resetSelectedPolylines();
    clearWorkSelection();
    clearCaveSelection(true);
    clearSubwaySelection(false);
  }, [
    resetSelectedMarker,
    resetSelectedPolylines,
    clearWorkSelection,
    clearCaveSelection,
    clearSubwaySelection,
  ]);

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
    visibleFrontLineState.visibleIds.forEach((id) => {
      const polylines = frontLinePolylinesByIdRef.current.get(id) ?? [];
      extendWithPolylineBounds(polylines);
    });
    if (!bounds || !bounds.isValid()) return;
    map.fitBounds(bounds, {
      padding: [30, 30],
    });
  }, [visibleFrontLineState]);

  const closeInfo = useCallback(() => {
    resetSelectedMarker();
    resetSelectedPolylines();
    clearCaveSelection(true);
    clearSubwaySelection(true);
    clearWorkSelection();
  }, [
    clearWorkSelection,
    clearCaveSelection,
    clearSubwaySelection,
    resetSelectedMarker,
    resetSelectedPolylines,
  ]);

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

    const panTo = (latlng: L.LatLng) => {
      if (window.innerWidth < 512) {
        const pt = map.latLngToContainerPoint(latlng);
        map.panTo(map.containerPointToLatLng(L.point(pt.x, pt.y + 100)));
      } else {
        map.panTo(latlng);
      }
    };

    const { workIdsWithPaths, polylinesByWorkId, polylineColorByWorkId } =
      buildWorkPolylineLayers({
        map,
        paths,
        works,
        defaultWorkColor: DEFAULT_WORK_COLOR,
        categoryColors: CATEGORY_COLORS,
        onClick: ({ work, latlng, workPolylines }) => {
          prepareForWorkSelection();
          workPolylines.forEach((pl) => {
            pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 });
          });
          selectedPolylinesRef.current = workPolylines;
          panTo(latlng);
          showWorkStack([work]);
        },
      });
    polylinesByWorkIdRef.current = polylinesByWorkId;

    polylineColorByWorkIdRef.current = polylineColorByWorkId;

    const cavePolygonsById = buildCavePolygonLayers({
      map,
      cavePaths,
      caves,
      caveBorderColor: CAVE_BORDER_COLOR,
      caveColor: CAVE_COLOR,
      onClick: ({ cave, cavePolygons, latlng }) => {
        prepareForCaveSelection();
        cavePolygons.forEach((pl) =>
          pl.setStyle({
            color: MARKER_COLOR_ACTIVE,
            fillColor: MARKER_COLOR_ACTIVE,
            fillOpacity: 1,
            opacity: 1,
          }),
        );
        setDisplayedCaveSelection(cave);
        panTo(latlng);
      },
    });
    cavePolygonsByCaveIdRef.current = cavePolygonsById;

    const subwayPolylinesById = buildSubwayPolylineLayers({
      map,
      subwayPaths,
      subways,
      caveColor: CAVE_COLOR,
      onClick: ({ subway, subwayPolylines, latlng }) => {
        prepareForSubwaySelection();
        subwayPolylines.forEach((pl) =>
          pl.setStyle({ color: MARKER_COLOR_ACTIVE, opacity: 1 }),
        );
        setDisplayedSubwaySelection(subway);
        panTo(latlng);
      },
    });
    subwayPolylinesBySubwayIdRef.current = subwayPolylinesById;

    const frontLinePolylinesById = buildFrontLineLayers({
      map,
      frontLinePaths,
      frontLines,
      britishLineColor: BRITISH_LINE_COLOR,
      germanLineColor: GERMAN_LINE_COLOR,
      pane: "frontLinePane",
    });
    frontLinePolylinesByIdRef.current = frontLinePolylinesById;
    markersRef.current = buildPointWorkMarkers({
      map,
      works,
      locale,
      allMonths,
      workIdsWithPaths,
      coordTolerance: COORD_TOLERANCE,
      typeColors: typeColorsRef.current,
      isWorkVisible,
      getDateRange: () => dateRangeRef.current,
      getSelectedTypes: () => selectedTypesRef.current,
      onClick: ({ marker, filteredWorks }) => {
        prepareForWorkSelection();
        selectedMarkerRef.current = marker;
        panTo(marker.getLatLng());
        showWorkStack(filteredWorks);
      },
    });

    map.on("click", () => {
      closeInfo();
    });

    const savedView = initialViewRef.current;
    if (savedView) {
      map.setView([savedView.lat, savedView.lng], savedView.zoom);
    } else {
      // Defer the initial fit until visibility filters have been applied,
      // so period links open focused on the filtered map state.
      pendingFilterFitRef.current = true;
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
    closeInfo,
    frontLines,
    frontLinePaths,
    clearWorkSelection,
    initialViewRef,
    prepareForCaveSelection,
    prepareForSubwaySelection,
    prepareForWorkSelection,
    setDisplayedCaveSelection,
    setDisplayedSubwaySelection,
    showWorkStack,
    stackedWorksRef,
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
    subwayPolylinesBySubwayIdRef.current.forEach((polylines, subwayId) => {
      const visible = visibleSubwayIds.has(subwayId);
      polylines.forEach((pl) => toggleLayer(pl, visible));
    });
    cavePolygonsByCaveIdRef.current.forEach((polygons) => {
      polygons.forEach((pl) => toggleLayer(pl, cavesVisible));
    });
    frontLinePolylinesByIdRef.current.forEach((polylines, id) => {
      const visible = visibleFrontLineState.visibleIds.has(id);
      const isOld = visible && !visibleFrontLineState.latestIds.has(id);
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
    visibleSubwayIds,
    cavesVisible,
    visibleFrontLineState,
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
          setDisplayedSubwaySelection(subway);
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
          setDisplayedCaveSelection(cave);
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
        showSingleWork(work);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [
    subways,
    caves,
    works,
    setDisplayedCaveSelection,
    setDisplayedSubwaySelection,
    showSingleWork,
    isDisplayedWorkVisible,
    isDisplayedSubwayVisible,
    isDisplayedCaveVisible,
    initialWorkIdRef,
    initialCaveIdRef,
    initialSubwayIdRef,
  ]);

  const handleApplyFilters = useCallback(
    (
      periodKey: string | null,
      periodStart: string | null,
      periodEnd: string | null,
      types: Set<string>,
    ) => {
      closeInfo();
      setActivePeriodKey(periodKey);
      setShowFrontLines(periodKey !== null);
      if (periodKey === null) {
        const typeBounds = computeTypeBounds(types);
        setDateRange(typeBounds ?? [minMonth, maxMonth]);
      } else {
        const pMin = dateToDay(periodStart!);
        const pMax = dateToDay(periodEnd!);
        setDateRange([pMin, pMax]);
      }
      setSelectedTypes(types);
      pendingFilterFitRef.current = true;
    },
    [
      closeInfo,
      minMonth,
      maxMonth,
      computeTypeBounds,
      setActivePeriodKey,
      setDateRange,
      setSelectedTypes,
      setShowFrontLines,
    ],
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
            onNavigate={navigateWorkStack}
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
          currentPeriodKey={activePeriodKey}
          periodBounds={periodBounds}
          clampBounds={clampBounds}
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

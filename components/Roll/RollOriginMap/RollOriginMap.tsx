"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import isEqual from "lodash/isEqual";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dialog } from "@/components/Dialog/Dialog";
import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";
import { Tunneller } from "@/types/tunnellers";
import { Filters } from "@/utils/helpers/rollParams";

import {
  createMissingOriginMarker,
  getOriginMarkerRadius,
  getOriginMarkerStyle,
  getOriginMapSummary,
  OriginMarker,
} from "./originMapMarkers";
import { RollOriginDrawer } from "./RollOriginDrawer";
import STYLES from "./RollOriginMap.module.scss";
import { RollOriginMapControls } from "./RollOriginMapControls";
import { useOriginDrawer } from "./useOriginDrawer";

type Props = {
  tunnellers: Record<string, Tunneller[]>;
  rollFiltersProps: Omit<ComponentProps<typeof RollFilter>, "className">;
  filters: Filters;
  defaultFilters: Filters;
  applyFilters: (_filters: Filters) => void;
  getFilteredTunnellerCount: (_filters: Filters) => number;
  activeFilterCount: number;
  totalTunnellers: number;
};

const UNKNOWN_ORIGIN_PARAM = "unknown";
const DEFAULT_MAP_ZOOM = 5;
const MAX_MAP_ZOOM = 16;
const MIN_MAP_ZOOM = 3;

function formatOriginCoordinate(coordinate: number): string {
  return Number(coordinate.toFixed(6)).toString();
}

function formatMapZoom(zoom: number): string {
  return Number(zoom.toFixed(2)).toString();
}

function getInitialMapZoom(): number {
  const zoomParam = new URLSearchParams(window.location.search).get("zoom");
  if (zoomParam === null) return DEFAULT_MAP_ZOOM;
  const zoom = Number(zoomParam);
  if (!Number.isFinite(zoom)) return DEFAULT_MAP_ZOOM;
  return Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));
}

function replaceRollOriginMapParams(
  updateParams: (_params: URLSearchParams) => void,
) {
  const params = new URLSearchParams(window.location.search);
  updateParams(params);
  const qs = params.toString().replace(/%2C/gi, ",");
  const url = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;
  window.history.replaceState(null, "", url);
}

export function RollOriginMap({
  tunnellers,
  rollFiltersProps,
  filters,
  defaultFilters,
  applyFilters,
  getFilteredTunnellerCount,
  activeFilterCount,
  totalTunnellers,
}: Props) {
  const tRoll = useTranslations("roll");
  const tMaps = useTranslations("maps");
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRestoredInitialOriginRef = useRef(false);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);
  const {
    closeOriginDrawer,
    isDrawerClosing,
    openOriginDrawer,
    renderedOrigin,
    selectedOrigin,
  } = useOriginDrawer();
  const summary = useMemo(() => getOriginMapSummary(tunnellers), [tunnellers]);
  const pendingFilteredCount = useMemo(
    () => getFilteredTunnellerCount(pendingFilters),
    [getFilteredTunnellerCount, pendingFilters],
  );

  const clearOriginMapSelectionParams = useCallback(() => {
    replaceRollOriginMapParams((params) => {
      params.delete("lat");
      params.delete("lng");
      params.delete("origin");
    });
  }, []);

  const closeOriginMapDrawer = useCallback(() => {
    closeOriginDrawer();
    clearOriginMapSelectionParams();
  }, [clearOriginMapSelectionParams, closeOriginDrawer]);

  const openMappedOriginDrawer = useCallback(
    (origin: OriginMarker) => {
      openOriginDrawer(origin);
      replaceRollOriginMapParams((params) => {
        params.set("view", "map");
        params.set("lat", formatOriginCoordinate(origin.latitude));
        params.set("lng", formatOriginCoordinate(origin.longitude));
        params.delete("origin");
      });
    },
    [openOriginDrawer],
  );

  const openMissingOriginDrawer = useCallback(() => {
    openOriginDrawer(
      createMissingOriginMarker(
        tMaps("originMissingTitle"),
        summary.missingOriginTunnellers,
      ),
    );
    replaceRollOriginMapParams((params) => {
      params.set("view", "map");
      params.set("origin", UNKNOWN_ORIGIN_PARAM);
      params.delete("lat");
      params.delete("lng");
    });
  }, [openOriginDrawer, summary.missingOriginTunnellers, tMaps]);

  const openDialog = useCallback(() => {
    closeOriginMapDrawer();
    setPendingFilters(filters);
    setIsDialogOpen(true);
  }, [closeOriginMapDrawer, filters]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    closeOriginMapDrawer();
    applyFilters(pendingFilters);
  }, [applyFilters, closeOriginMapDrawer, pendingFilters]);

  const resetPendingFilters = useCallback(() => {
    setPendingFilters(defaultFilters);
  }, [defaultFilters]);

  const openRollList = useCallback(() => {
    replaceRollOriginMapParams((params) => {
      params.delete("view");
      params.delete("lat");
      params.delete("lng");
      params.delete("origin");
      params.delete("zoom");
    });
  }, []);

  const pendingRollFiltersProps = useMemo<
    Omit<ComponentProps<typeof RollFilter>, "className">
  >(() => {
    const startBirthYear = pendingFilters.birthYear?.[0] ?? "";
    const endBirthYear =
      pendingFilters.birthYear?.[pendingFilters.birthYear.length - 1] ?? "";
    const startDeathYear = pendingFilters.deathYear?.[0] ?? "";
    const endDeathYear =
      pendingFilters.deathYear?.[pendingFilters.deathYear.length - 1] ?? "";

    return {
      ...rollFiltersProps,
      filters: pendingFilters,
      startBirthYear,
      endBirthYear,
      startDeathYear,
      endDeathYear,
      handleDetachmentFilter: (detachmentId: number | null) => {
        setPendingFilters((prev) => {
          const detachmentSet = new Set(prev.detachment ?? []);
          detachmentSet.has(detachmentId)
            ? detachmentSet.delete(detachmentId)
            : detachmentSet.add(detachmentId);
          return { ...prev, detachment: Array.from(detachmentSet) };
        });
      },
      handleCorpsFilter: (corpsId: number | null) => {
        setPendingFilters((prev) => {
          const corpsSet = new Set(prev.corps ?? []);
          corpsSet.has(corpsId)
            ? corpsSet.delete(corpsId)
            : corpsSet.add(corpsId);
          return { ...prev, corps: Array.from(corpsSet) };
        });
      },
      handleBirthSliderChange: (value: number | number[]) => {
        if (!Array.isArray(value)) return;
        const [start, end] = value;
        setPendingFilters((prev) => ({
          ...prev,
          birthYear: rollFiltersProps.uniqueBirthYears.filter(
            (year) => year >= String(start) && year <= String(end),
          ),
        }));
      },
      handleDeathSliderChange: (value: number | number[]) => {
        if (!Array.isArray(value)) return;
        const [start, end] = value;
        setPendingFilters((prev) => ({
          ...prev,
          deathYear: rollFiltersProps.uniqueDeathYears.filter(
            (year) => year >= String(start) && year <= String(end),
          ),
        }));
      },
      handleSliderDragStart: () => undefined,
      handleSliderDragComplete: () => undefined,
      handleRankFilter: (ranksFilter: Record<string, (number | null)[]>) => {
        setPendingFilters((prev) => {
          const nextRanks: Record<string, (number | null)[]> = {
            ...prev.ranks,
          };
          Object.entries(ranksFilter).forEach(([category, rankIds]) => {
            const rankSet = new Set(nextRanks[category] ?? []);
            const allSelected = rankIds.every((id) => rankSet.has(id));
            if (allSelected) {
              rankIds.forEach((id) => rankSet.delete(id));
            } else {
              rankIds.forEach((id) => rankSet.add(id));
            }
            nextRanks[category] = Array.from(rankSet);
          });
          return { ...prev, ranks: nextRanks };
        });
      },
      handleUnknownBirthYear: (unknown: string) => {
        setPendingFilters((prev) => ({
          ...prev,
          unknownBirthYear: unknown ? "unknown" : "",
        }));
      },
      handleUnknownDeathYear: (unknown: string) => {
        setPendingFilters((prev) => ({
          ...prev,
          unknownDeathYear: unknown ? "unknown" : "",
        }));
      },
    };
  }, [pendingFilters, rollFiltersProps]);

  const zoom = useCallback((dir: 1 | -1) => {
    mapRef.current?.[dir === 1 ? "zoomIn" : "zoomOut"]();
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
    });
  }, [selectedOrigin]);

  useEffect(() => {
    if (hasRestoredInitialOriginRef.current) return;
    hasRestoredInitialOriginRef.current = true;

    const params = new URLSearchParams(window.location.search);

    if (params.get("origin") === UNKNOWN_ORIGIN_PARAM) {
      if (summary.missingOriginTunnellers.length === 0) return;
      openOriginDrawer(
        createMissingOriginMarker(
          tMaps("originMissingTitle"),
          summary.missingOriginTunnellers,
        ),
      );
      return;
    }

    const latitudeParam = Number(params.get("lat"));
    const longitudeParam = Number(params.get("lng"));
    if (!Number.isFinite(latitudeParam) || !Number.isFinite(longitudeParam)) {
      return;
    }

    const matchingMarker = summary.markers.find(
      (marker) =>
        formatOriginCoordinate(marker.latitude) ===
          formatOriginCoordinate(latitudeParam) &&
        formatOriginCoordinate(marker.longitude) ===
          formatOriginCoordinate(longitudeParam),
    );

    if (matchingMarker) openOriginDrawer(matchingMarker);
  }, [
    openOriginDrawer,
    summary.markers,
    summary.missingOriginTunnellers,
    tMaps,
  ]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      maxZoom: MAX_MAP_ZOOM,
      minZoom: MIN_MAP_ZOOM,
      zoomControl: false,
    }).setView([-41.2865, 174.7762], getInitialMapZoom());

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: MAX_MAP_ZOOM,
      },
    ).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    map.on("zoomend", () => {
      const nextZoom = map.getZoom();
      setCurrentZoom(nextZoom);
      replaceRollOriginMapParams((params) => {
        params.set("view", "map");
        params.set("zoom", formatMapZoom(nextZoom));
      });
    });
    setCurrentZoom(map.getZoom());
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map || typeof ResizeObserver === "undefined") return;

    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.invalidateSize();
        frame = null;
      });
    });

    observer.observe(container);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const markerLayer = markerLayerRef.current;
    if (!markerLayer) return;

    markerLayer.clearLayers();
    summary.markers.forEach((marker) => {
      const isSelected =
        selectedOrigin?.town === marker.town &&
        selectedOrigin.latitude === marker.latitude &&
        selectedOrigin.longitude === marker.longitude;
      const circleMarker = L.circleMarker([marker.latitude, marker.longitude], {
        radius: getOriginMarkerRadius(marker.count),
        ...getOriginMarkerStyle(isSelected),
      })
        .on("click", () => openMappedOriginDrawer(marker))
        .bindTooltip(`${marker.town} (${marker.count})`, {
          className: "roll-origin-tooltip",
        })
        .addTo(markerLayer);

      if (isSelected) circleMarker.bringToFront();
    });
  }, [openMappedOriginDrawer, selectedOrigin, summary.markers]);

  return (
    <>
      <Dialog
        id="roll-origin-map-filters"
        isFooterEnabled={true}
        isOpen={isDialogOpen}
        handleResetFilters={resetPendingFilters}
        hasActiveFilters={!isEqual(pendingFilters, defaultFilters)}
        onClose={closeDialog}
        title={tRoll("filters")}
        totalFiltered={pendingFilteredCount}
        total={totalTunnellers}
      >
        <RollFilter
          {...pendingRollFiltersProps}
          className={STYLES["filters-container"]}
        />
      </Dialog>
      <div
        className={`${STYLES.container} ${selectedOrigin ? STYLES["container--drawer-open"] : ""}`.trim()}
        data-testid="roll-origin-map"
      >
        <div ref={containerRef} className={STYLES.map} />
        <RollOriginDrawer
          origin={renderedOrigin}
          isClosing={isDrawerClosing}
          onClose={closeOriginMapDrawer}
        />
        <RollOriginMapControls
          activeFilterCount={activeFilterCount}
          currentZoom={currentZoom}
          mappedCount={summary.mappedCount}
          missingOriginCount={summary.missingOriginCount}
          onOpenFilters={openDialog}
          onOpenMissingOrigin={openMissingOriginDrawer}
          onOpenRollList={openRollList}
          onZoomIn={() => zoom(1)}
          onZoomOut={() => zoom(-1)}
          visibleCount={summary.visibleCount}
        />
      </div>
    </>
  );
}

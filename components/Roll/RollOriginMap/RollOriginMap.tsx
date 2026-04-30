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

import { getOriginMapSummary, OriginMarker } from "./originMapMarkers";
import { RollOriginDrawer } from "./RollOriginDrawer";
import STYLES from "./RollOriginMap.module.scss";

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
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);
  const [selectedOrigin, setSelectedOrigin] = useState<OriginMarker | null>(
    null,
  );
  const summary = useMemo(() => getOriginMapSummary(tunnellers), [tunnellers]);
  const pendingFilteredCount = useMemo(
    () => getFilteredTunnellerCount(pendingFilters),
    [getFilteredTunnellerCount, pendingFilters],
  );

  const openDialog = useCallback(() => {
    setSelectedOrigin(null);
    setPendingFilters(filters);
    setIsDialogOpen(true);
  }, [filters]);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedOrigin(null);
    applyFilters(pendingFilters);
  }, [applyFilters, pendingFilters]);

  const resetPendingFilters = useCallback(() => {
    setPendingFilters(defaultFilters);
  }, [defaultFilters]);

  const closeOriginDrawer = useCallback(() => {
    setSelectedOrigin(null);
  }, []);

  const openRollList = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("view");
    const qs = params.toString().replace(/%2C/gi, ",");
    const url = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
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
    document.body.classList.toggle(
      "roll-origin-drawer-open",
      selectedOrigin !== null,
    );

    return () => {
      document.body.classList.remove("roll-origin-drawer-open");
    };
  }, [selectedOrigin]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      maxZoom: 16,
      minZoom: 3,
      zoomControl: false,
    }).setView([-41.2865, 174.7762], 5);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        maxZoom: 16,
      },
    ).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    map.on("zoomend", () => setCurrentZoom(map.getZoom()));
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
      const radius = marker.count > 1 ? 8 + Math.min(marker.count, 20) : 7;
      const circleMarker = L.circleMarker([marker.latitude, marker.longitude], {
        radius,
        color: isSelected ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0.85)",
        weight: isSelected ? 2 : 1,
        fillColor: isSelected ? "rgb(255, 255, 255)" : "rgb(153, 131, 100)",
        fillOpacity: isSelected ? 1 : 0.85,
      })
        .on("click", () => setSelectedOrigin(marker))
        .bindTooltip(`${marker.town} (${marker.count})`, {
          className: "roll-origin-tooltip",
        })
        .addTo(markerLayer);

      if (isSelected) circleMarker.bringToFront();
    });
  }, [selectedOrigin, summary.markers]);

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
        <RollOriginDrawer origin={selectedOrigin} onClose={closeOriginDrawer} />
        <div className={STYLES["map-controls"]}>
          <div className={STYLES["controls-grid"]}>
            <div className={STYLES["controls-top-row"]}>
              <button
                className={STYLES["roll-button"]}
                onClick={openRollList}
                aria-label={tRoll("openRollList")}
              >
                {tRoll("rollList")}
              </button>
              <button
                className={`${STYLES["filter-button"]} ${activeFilterCount > 0 ? STYLES["filter-button--active"] : ""}`.trim()}
                onClick={openDialog}
                aria-label={tMaps("toggleFilters")}
              >
                {tRoll("filters")}
                {activeFilterCount > 0 && (
                  <span className={STYLES["filter-badge"]}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => zoom(1)}
                aria-label={tMaps("zoomIn")}
                className={STYLES["zoom-button"]}
                disabled={currentZoom !== null && currentZoom >= 16}
              >
                +
              </button>
              <button
                onClick={() => zoom(-1)}
                aria-label={tMaps("zoomOut")}
                className={STYLES["zoom-button"]}
                disabled={currentZoom !== null && currentZoom <= 3}
              >
                −
              </button>
            </div>
            <div className={STYLES["stats-row"]}>
              <div className={STYLES["map-count"]}>
                <span className={STYLES["count-label"]}>
                  {tMaps("originMappedLabel")}
                </span>
                <span className={STYLES["count-primary"]}>
                  {summary.mappedCount}
                  <span className={STYLES["count-total"]}>
                    /{summary.visibleCount}
                  </span>
                </span>
              </div>
              <div className={STYLES["missing-count"]}>
                <span className={STYLES["count-label"]}>
                  {tMaps("originMissingLabel")}
                </span>
                <span className={STYLES["count-primary"]}>
                  {summary.missingOriginCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

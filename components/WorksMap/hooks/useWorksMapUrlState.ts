"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import { CaveData } from "@/utils/database/queries/cavesQuery";
import { SubwayData } from "@/utils/database/queries/subwaysQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

import { dateToDay, dayToParam, paramToDay, toSlug } from "../utils/mapParams";

type InitialView = {
  lat: number;
  lng: number;
  zoom: number;
};

type Params = {
  minMonth: number;
  maxMonth: number;
  slugToName: Map<string, string>;
  nameToSlug: Map<string, string>;
  displayedWork: WorkData | null;
  displayedWorkRef: RefObject<WorkData | null>;
  displayedCave: CaveData | null;
  displayedCaveRef: RefObject<CaveData | null>;
  displayedSubway: SubwayData | null;
  displayedSubwayRef: RefObject<SubwayData | null>;
};

export function useWorksMapUrlState({
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
}: Params) {
  const searchParams = useSearchParams();
  const isFirstRenderRef = useRef(true);

  const isPeriodParam = searchParams.get("period") === "true";
  const isFrontLinesParam = searchParams.get("frontlines") === "true";
  const initialPeriodKey = useMemo(() => {
    if (!isPeriodParam) return null;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    return fromParam && toParam ? `${fromParam}/${toParam}` : null;
  }, [isPeriodParam, searchParams]);

  const [activePeriodKey, setActivePeriodKey] = useState<string | null>(
    () => initialPeriodKey,
  );
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

  const initialWorkIdRef = useRef<number | null>(
    (() => {
      const initialWorkId = searchParams.get("work");
      return initialWorkId ? Number(initialWorkId) : null;
    })(),
  );
  const initialCaveIdRef = useRef<number | null>(
    (() => {
      const initialCaveId = searchParams.get("cave");
      return initialCaveId ? Number(initialCaveId) : null;
    })(),
  );
  const initialSubwayIdRef = useRef<number | null>(
    (() => {
      const initialSubwayId = searchParams.get("subway");
      return initialSubwayId ? Number(initialSubwayId) : null;
    })(),
  );
  const initialViewRef = useRef<InitialView | null>(
    (() => {
      const initialLat = searchParams.get("lat");
      const initialLng = searchParams.get("lng");
      const initialZoom = searchParams.get("zoom");
      return initialLat && initialLng && initialZoom
        ? {
            lat: Number(initialLat),
            lng: Number(initialLng),
            zoom: Number(initialZoom),
          }
        : null;
    })(),
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
    displayedWorkRef,
    displayedCaveRef,
    displayedSubwayRef,
  ]);

  return {
    initialPeriodKey,
    activePeriodKey,
    setActivePeriodKey,
    isPeriodActive,
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
  };
}

"use client";

import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RollAlphabet } from "@/components/Roll/RollAlphabet/RollAlphabet";
import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";
import { RollNoResults } from "@/components/Roll/RollNoResults/RollNoResults";
import { Title } from "@/components/Title/Title";
import { Tunneller } from "@/types/tunnellers";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Roll.module.scss";
import { getUniqueCorps } from "./utils/corpsUtils";
import { getUniqueDetachments } from "./utils/detachmentUtils";
import {
  getSortedRanks,
  getUniqueRanks,
  rankCategories,
} from "./utils/rankUtils";
import { getUniqueBirthYears, getUniqueDeathYears } from "./utils/yearsUtils";
import { Dialog } from "../Dialog/Dialog";

type Props = {
  tunnellers: Record<string, Tunneller[]>;
};

type Filters = {
  detachment: string[];
  corps: string[];
  ranks: Record<string, string[]>;
  birthYear: string[];
  unknownBirthYear: string;
  deathYear: string[];
  unknownDeathYear: string;
};

export function Roll({ tunnellers }: Props) {
  const { width } = useWindowDimensions();

  /** ---- Derived data ---- */
  const tunnellersList = useMemo(
    () => Object.entries(tunnellers),
    [tunnellers],
  );
  const uniqueDetachments = useMemo(
    () => getUniqueDetachments(tunnellersList),
    [tunnellersList],
  );
  const uniqueCorps = useMemo(
    () => getUniqueCorps(tunnellersList),
    [tunnellersList],
  );
  const uniqueRanks = useMemo(
    () => getUniqueRanks(tunnellersList),
    [tunnellersList],
  );
  const sortedRanks = useMemo(() => getSortedRanks(uniqueRanks), [uniqueRanks]);
  const uniqueBirthYears = useMemo(
    () => getUniqueBirthYears(tunnellersList),
    [tunnellersList],
  );
  const uniqueDeathYears = useMemo(
    () => getUniqueDeathYears(tunnellersList),
    [tunnellersList],
  );

  /** ---- Defaults ---- */
  const defaultFilters: Filters = useMemo(
    () => ({
      detachment: [],
      corps: [],
      ranks: {
        Officers: [],
        "Non-Commissioned Officers": [],
        "Other Ranks": [],
      },
      birthYear: uniqueBirthYears,
      unknownBirthYear: "unknown",
      deathYear: uniqueDeathYears,
      unknownDeathYear: "unknown",
    }),
    [uniqueBirthYears, uniqueDeathYears],
  );

  /** ---- Initial state ---- */
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);

  /** ---- Hydration + persistence gating (no extra render) ---- */
  const hydratedRef = useRef(false);

  /** ---- Read from localStorage ---- */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const storedFilters = localStorage.getItem("filters");
    const storedPage = localStorage.getItem("page");

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (storedFilters) {
        setFilters(JSON.parse(storedFilters));
      }
      if (storedPage) {
        const n = Number(storedPage);
        if (Number.isFinite(n) && n > 0) setCurrentPage(n);
      }

      hydratedRef.current = true;
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** ---- Persist to localStorage AFTER hydration ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !hydratedRef.current) return;

    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydratedRef.current) return;

    localStorage.setItem("page", String(currentPage));
  }, [currentPage]);

  /** ---- Helpers ---- */
  const hasAnyActiveFilter = (f: Filters): boolean => {
    const ranksActive = Object.values(f.ranks ?? {}).some((arr) => arr.length);
    const detachmentActive = (f.detachment ?? []).length > 0;
    const corpsActive = (f.corps ?? []).length > 0;
    const birthActive =
      (f.birthYear ?? []).length > 0 || f.unknownBirthYear === "unknown";
    const deathActive =
      (f.deathYear ?? []).length > 0 || f.unknownDeathYear === "unknown";
    return (
      ranksActive ||
      detachmentActive ||
      corpsActive ||
      birthActive ||
      deathActive
    );
  };

  /** ---- Filtering ---- */
  const filteredGroups: [string, Tunneller[]][] = useMemo(() => {
    if (!hasAnyActiveFilter(filters)) return [];
    return tunnellersList
      .map<[string, Tunneller[]]>(([group, list]) => [
        group,
        list
          .filter(
            (t) =>
              !filters.detachment?.length ||
              filters.detachment.includes(t.detachment),
          )
          .filter((t) => {
            if (!filters.corps?.length) return true;
            if (
              filters.corps.includes("Tunnelling Corps") &&
              t.attachedCorps === null
            )
              return true;
            return filters.corps.includes(t.attachedCorps ?? "");
          })
          .filter((t) => {
            const r = filters.ranks;
            if (!r || Object.values(r).every((arr) => arr.length === 0))
              return true;
            return Object.values(r).some((arr) => arr.includes(t.rank));
          })
          .filter((t) => {
            const wantsUnknown = filters.unknownBirthYear === "unknown";
            const list = filters.birthYear ?? [];
            if (wantsUnknown && t.birthYear === null) return true;
            if (list.length && t.birthYear) return list.includes(t.birthYear);
            return !wantsUnknown && list.length === 0;
          })
          .filter((t) => {
            const wantsUnknown = filters.unknownDeathYear === "unknown";
            const list = filters.deathYear ?? [];
            if (wantsUnknown && t.deathYear === null) return true;
            if (list.length && t.deathYear) return list.includes(t.deathYear);
            return !wantsUnknown && list.length === 0;
          }),
      ])
      .filter(([, list]) => list.length > 0);
  }, [filters, tunnellersList]);

  const totalFilteredTunnellers = useMemo(
    () => filteredGroups.reduce((acc, [, list]) => acc + list.length, 0),
    [filteredGroups],
  );
  const totalTunnellers = useMemo(
    () => tunnellersList.reduce((acc, [, list]) => acc + list.length, 0),
    [tunnellersList],
  );

  const startBirthYear = filters.birthYear?.[0];
  const endBirthYear = filters.birthYear?.[filters.birthYear.length - 1];
  const startDeathYear = filters.deathYear?.[0];
  const endDeathYear = filters.deathYear?.[filters.deathYear.length - 1];

  /** ---- Handlers ---- */
  const setPageToFirst = useCallback(() => setCurrentPage(1), []);

  const handleDetachmentFilter = useCallback(
    (detachment: string) => {
      setFilters((prev) => {
        const det = new Set(prev.detachment ?? []);
        det.has(detachment) ? det.delete(detachment) : det.add(detachment);
        return { ...prev, detachment: Array.from(det) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleCorpsFilter = useCallback(
    (corps: string) => {
      setFilters((prev) => {
        const set = new Set(prev.corps ?? []);
        set.has(corps) ? set.delete(corps) : set.add(corps);
        return { ...prev, corps: Array.from(set) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleBirthSliderChange = useCallback(
    (value: number | number[]) => {
      if (!Array.isArray(value)) return;
      const [start, end] = value;
      setFilters((prev) => ({
        ...prev,
        birthYear: uniqueBirthYears.filter(
          (y) => y >= String(start) && y <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueBirthYears, setPageToFirst],
  );

  const handleUnknwonBirthYear = useCallback(
    (unknown: string) => {
      setFilters((prev) => ({
        ...prev,
        unknownBirthYear: unknown ? "unknown" : "",
      }));
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleDeathSliderChange = useCallback(
    (value: number | number[]) => {
      if (!Array.isArray(value)) return;
      const [start, end] = value;
      setFilters((prev) => ({
        ...prev,
        deathYear: uniqueDeathYears.filter(
          (y) => y >= String(start) && y <= String(end),
        ),
      }));
      setPageToFirst();
    },
    [uniqueDeathYears, setPageToFirst],
  );

  const handleUnknwonDeathYear = useCallback(
    (unknown: string) => {
      setFilters((prev) => ({
        ...prev,
        unknownDeathYear: unknown ? "unknown" : "",
      }));
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleRankFilter = useCallback(
    (ranksFilter: Record<string, string[]>) => {
      setFilters((prev) => {
        const nextRanks: Record<string, string[]> = { ...prev.ranks };
        Object.entries(ranksFilter).forEach(([category, ranks]) => {
          if (ranks.length === 0) {
            const allSelected = rankCategories[category].every((rank) =>
              (nextRanks[category] ?? []).includes(rank),
            );
            nextRanks[category] = allSelected ? [] : rankCategories[category];
          } else {
            const set = new Set(nextRanks[category] ?? []);
            ranks.forEach((rank) =>
              set.has(rank) ? set.delete(rank) : set.add(rank),
            );
            nextRanks[category] = Array.from(set);
          }
        });
        return { ...prev, ranks: nextRanks };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleResetFilters = useCallback(() => {
    if (!isEqual(filters, defaultFilters)) {
      setCurrentPage(1);
      setFilters(defaultFilters);
    }
  }, [filters, defaultFilters]);

  /** ---- Dialog state ---- */
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);
  const handleFilterButton = useCallback(() => setIsOpen(true), []);

  const rollFiltersProps = {
    className: STYLES["filters-container"],
    uniqueDetachments,
    uniquecorps: uniqueCorps,
    uniqueBirthYears,
    uniqueDeathYears,
    sortedRanks,
    filters,
    startBirthYear,
    endBirthYear,
    startDeathYear,
    endDeathYear,
    handleDetachmentFilter,
    handleCorpsFilter,
    handleBirthSliderChange,
    handleDeathSliderChange,
    handleRankFilter,
    handleUnknwonBirthYear,
    handleUnknwonDeathYear,
  };

  const isDesktop = () => (width ? width > 896 : false);

  return (
    <>
      <Dialog
        id="filter-dialog"
        isFooterEnabled={true}
        isOpen={isOpen}
        handleResetFilters={handleResetFilters}
        onClose={onClose}
        title="Filters"
        totalFiltered={totalFilteredTunnellers}
        total={totalTunnellers}
      >
        <RollFilter {...rollFiltersProps} />
      </Dialog>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <Title title={"The New Zealand\\Tunnellers"} />
        </div>
        {ready && (
          <div className={STYLES["roll-container"]}>
            <div className={STYLES.controls}>
              <div className={STYLES["results-container"]}>
                <button
                  className={STYLES["reset-button"]}
                  onClick={handleResetFilters}
                >
                  Reset filters
                </button>
                <p className={STYLES.results}>
                  {`${totalFilteredTunnellers} result${totalFilteredTunnellers > 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                className={STYLES["filter-button"]}
                onClick={handleFilterButton}
              >
                Filters
              </button>
              {isDesktop() ? <RollFilter {...rollFiltersProps} /> : null}
            </div>
            {filteredGroups.length > 0 ? (
              <RollAlphabet
                tunnellers={filteredGroups}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            ) : (
              <RollNoResults handleResetFilters={handleResetFilters} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

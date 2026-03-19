"use client";

import isEqual from "lodash/isEqual";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RollAlphabet } from "@/components/Roll/RollAlphabet/RollAlphabet";
import { RollFilter } from "@/components/Roll/RollFilter/RollFilter";
import { RollNoResults } from "@/components/Roll/RollNoResults/RollNoResults";
import { Title } from "@/components/Title/Title";
import { Tunneller } from "@/types/tunnellers";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Roll.module.scss";
import { getUniqueCorps } from "./utils/corpsUtils";
import { getUniqueDetachments } from "./utils/detachmentUtils";
import { getSortedRanks, getUniqueRanks } from "./utils/rankUtils";
import { getUniqueBirthYears, getUniqueDeathYears } from "./utils/yearsUtils";
import { Dialog } from "../Dialog/Dialog";

type Props = {
  tunnellers: Record<string, Tunneller[]>;
};

type Filters = {
  detachment: (number | null)[];
  corps: (number | null)[];
  ranks: Record<string, (number | null)[]>;
  birthYear: string[];
  unknownBirthYear: string;
  deathYear: string[];
  unknownDeathYear: string;
};

export function Roll({ tunnellers }: Props) {
  const t = useTranslations("roll");
  const locale = useLocale();
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
  const sortedRanks = useMemo(
    () => getSortedRanks(uniqueRanks, locale as "en" | "fr"),
    [uniqueRanks, locale],
  );
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

  // Normalize any previously stored filters to the current shape
  const isIdArray = (arr: unknown[]): arr is (number | null)[] =>
    arr.every((x) => typeof x === "number" || x === null);

  const normalizeFilters = (raw: unknown, defaults: Filters): Filters => {
    try {
      const p = (raw ?? {}) as Partial<Filters>;
      const ranks = (p.ranks ?? {}) as Record<string, (number | null)[]>;
      const mergedRanks: Filters["ranks"] = {
        Officers:
          Array.isArray(ranks?.Officers) && isIdArray(ranks.Officers)
            ? ranks.Officers
            : [],
        "Non-Commissioned Officers":
          Array.isArray(ranks?.["Non-Commissioned Officers"]) &&
          isIdArray(ranks["Non-Commissioned Officers"])
            ? ranks["Non-Commissioned Officers"]
            : [],
        "Other Ranks":
          Array.isArray(ranks?.["Other Ranks"]) &&
          isIdArray(ranks["Other Ranks"])
            ? ranks["Other Ranks"]
            : [],
      };
      return {
        detachment:
          Array.isArray(p.detachment) && isIdArray(p.detachment)
            ? p.detachment
            : defaults.detachment,
        corps:
          Array.isArray(p.corps) && isIdArray(p.corps)
            ? p.corps
            : defaults.corps,
        ranks: mergedRanks,
        birthYear: Array.isArray(p.birthYear)
          ? p.birthYear
          : defaults.birthYear,
        unknownBirthYear:
          typeof p.unknownBirthYear === "string"
            ? p.unknownBirthYear
            : defaults.unknownBirthYear,
        deathYear: Array.isArray(p.deathYear)
          ? p.deathYear
          : defaults.deathYear,
        unknownDeathYear:
          typeof p.unknownDeathYear === "string"
            ? p.unknownDeathYear
            : defaults.unknownDeathYear,
      };
    } catch {
      return defaults;
    }
  };

  /** ---- Initial state ---- */
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("filters");
        if (raw) {
          return normalizeFilters(JSON.parse(raw), defaultFilters);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load filters: ${errorMessage}`);
      }
    }
    return defaultFilters;
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("page");
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) return n;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load current page: ${errorMessage}`);
      }
    }
    return 1;
  });

  /** ---- Persist to localStorage ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("filters", JSON.stringify(filters));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save filters: ${errorMessage}`);
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("page", String(currentPage));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save current page: ${errorMessage}`);
    }
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("roll:scrollY");
    const y = raw ? Number(raw) : 0;
    if (Number.isFinite(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

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
              filters.detachment.includes(t.detachmentId),
          )
          .filter((t) => {
            if (!filters.corps?.length) return true;
            return filters.corps.includes(t.corpsId);
          })
          .filter((t) => {
            const r = filters.ranks;
            if (!r || Object.values(r).every((arr) => arr.length === 0))
              return true;
            return Object.values(r).some((arr) => arr.includes(t.rankId));
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
    (detachmentId: number | null) => {
      setFilters((prev) => {
        const det = new Set(prev.detachment ?? []);
        det.has(detachmentId)
          ? det.delete(detachmentId)
          : det.add(detachmentId);
        return { ...prev, detachment: Array.from(det) };
      });
      setPageToFirst();
    },
    [setPageToFirst],
  );

  const handleCorpsFilter = useCallback(
    (corpsId: number | null) => {
      setFilters((prev) => {
        const set = new Set(prev.corps ?? []);
        set.has(corpsId) ? set.delete(corpsId) : set.add(corpsId);
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
    (ranksFilter: Record<string, (number | null)[]>) => {
      setFilters((prev) => {
        const nextRanks: Record<string, (number | null)[]> = { ...prev.ranks };
        Object.entries(ranksFilter).forEach(([category, rankIds]) => {
          const set = new Set(nextRanks[category] ?? []);
          const allSelected = rankIds.every((id) => set.has(id));
          if (allSelected) {
            rankIds.forEach((id) => set.delete(id));
          } else {
            rankIds.forEach((id) => set.add(id));
          }
          nextRanks[category] = Array.from(set);
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
        title={t("filters")}
        totalFiltered={totalFilteredTunnellers}
        total={totalTunnellers}
      >
        <RollFilter {...rollFiltersProps} />
      </Dialog>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <Title title={t("title")} />
        </div>

        <div className={STYLES["roll-container"]}>
          <div className={STYLES.controls}>
            <div className={STYLES["results-container"]}>
              <button
                className={STYLES["reset-button"]}
                onClick={handleResetFilters}
              >
                {t("resetFilters")}
              </button>
              <p className={STYLES.results}>
                {totalFilteredTunnellers > 1
                  ? t("resultsPlural", { count: totalFilteredTunnellers })
                  : t("results", { count: totalFilteredTunnellers })}
              </p>
            </div>
            <button
              className={STYLES["filter-button"]}
              onClick={handleFilterButton}
            >
              {t("filters")}
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
      </div>
    </>
  );
}

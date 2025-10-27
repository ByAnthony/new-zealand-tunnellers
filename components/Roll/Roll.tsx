"use client";

import isEqual from "lodash/isEqual";
import { useEffect, useState } from "react";

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

  const tunnellersList = Object.entries(tunnellers);
  const uniqueDetachments: string[] = getUniqueDetachments(tunnellersList);
  const uniquecorps: string[] = getUniqueCorps(tunnellersList);
  const uniqueRanks: string[] = getUniqueRanks(tunnellersList);
  const sortedRanks: Record<string, string[]> = getSortedRanks(uniqueRanks);
  const uniqueBirthYears: string[] = getUniqueBirthYears(tunnellersList);
  const uniqueDeathYears: string[] = getUniqueDeathYears(tunnellersList);

  const filterList: Filters = {
    detachment: [],
    corps: [],
    ranks: { Officers: [], "Non-Commissioned Officers": [], "Other Ranks": [] },
    birthYear: uniqueBirthYears,
    unknownBirthYear: "unknown",
    deathYear: uniqueDeathYears,
    unknownDeathYear: "unknown",
  };

  const [filters, setFilters] = useState<Filters>(filterList);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFilters = localStorage.getItem("filters");
      if (storedFilters) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters(JSON.parse(storedFilters));
      }
      const storedPage = localStorage.getItem("page");
      if (storedPage) {
        setCurrentPage(Number(storedPage));
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (typeof window !== "undefined") {
        localStorage.setItem("filters", JSON.stringify(filters));
      }
    }
  }, [filters, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (typeof window !== "undefined") {
        localStorage.setItem("page", currentPage.toString());
      }
    }
  }, [currentPage, isLoaded]);

  const handleDetachmentFilter = (detachment: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (!newFilters.detachment) {
        newFilters.detachment = [];
      }
      if (newFilters.detachment.includes(detachment)) {
        newFilters.detachment = newFilters.detachment.filter(
          (d) => d !== detachment,
        );
      } else {
        newFilters.detachment.push(detachment);
      }

      setCurrentPage(1);
      return newFilters;
    });
  };

  const handleCorpsFilter = (corps: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (!newFilters.corps) {
        newFilters.corps = [];
      }
      if (newFilters.corps.includes(corps)) {
        newFilters.corps = newFilters.corps.filter((c) => c !== corps);
      } else {
        newFilters.corps.push(corps);
      }

      setCurrentPage(1);
      return newFilters;
    });
  };

  const handleBirthSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        const [startYear, endYear] = value;
        newFilters.birthYear = uniqueBirthYears.filter(
          (year) => year >= String(startYear) && year <= String(endYear),
        );

        setCurrentPage(1);
        return newFilters;
      });
    }
  };

  const handleUnknwonBirthYear = (unknown: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      newFilters.unknownBirthYear = unknown ? "unknown" : "";

      setCurrentPage(1);
      return newFilters;
    });
  };

  const handleDeathSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        const [startYear, endYear] = value;
        newFilters.deathYear = uniqueDeathYears.filter(
          (year) => year >= String(startYear) && year <= String(endYear),
        );

        setCurrentPage(1);
        return newFilters;
      });
    }
  };

  const handleUnknwonDeathYear = (unknown: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      newFilters.unknownDeathYear = unknown ? "unknown" : "";

      setCurrentPage(1);
      return newFilters;
    });
  };

  const handleRankFilter = (ranksFilter: Record<string, string[]>) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      newFilters.ranks = { ...prevFilters.ranks };

      Object.entries(ranksFilter).forEach(([category, ranks]) => {
        if (ranks.length === 0) {
          const allSelected = rankCategories[category].every((rank) =>
            newFilters.ranks[category].includes(rank),
          );

          newFilters.ranks[category] = allSelected
            ? []
            : rankCategories[category];
        } else {
          ranks.forEach((rank) => {
            const categoryRanks = newFilters.ranks[category];
            if (categoryRanks.includes(rank)) {
              newFilters.ranks[category] = categoryRanks.filter(
                (r) => r !== rank,
              );
            } else {
              categoryRanks.push(rank);
            }
          });
        }
      });

      setCurrentPage(1);
      return newFilters;
    });
  };

  const isFiltered = (filters: Filters): [string, Tunneller[]][] =>
    Object.values(filters).every((filter) => filter.length === 0)
      ? []
      : tunnellersList
          .map(([group, tunnellers]): [string, Tunneller[]] => [
            group,
            tunnellers
              .filter((tunneller) => {
                const detachmentMatch =
                  !filters.detachment ||
                  filters.detachment.length === 0 ||
                  filters.detachment.includes(tunneller.detachment);
                return detachmentMatch;
              })
              .filter((tunneller) => {
                const corpsMatch =
                  !filters.corps ||
                  filters.corps.length === 0 ||
                  (filters.corps &&
                    filters.corps.includes("Tunnelling Corps") &&
                    tunneller.attachedCorps === null) ||
                  filters.corps.includes(tunneller.attachedCorps ?? "");
                return corpsMatch;
              })
              .filter((tunneller) => {
                if (
                  !filters.ranks ||
                  Object.values(filters.ranks).every(
                    (ranks) => ranks.length === 0,
                  )
                ) {
                  return true;
                }
                return Object.entries(filters.ranks).some(([, ranks]) =>
                  ranks.includes(tunneller.rank),
                );
              })
              .filter((tunneller) => {
                const birthYearMatch =
                  (filters.unknownBirthYear === "unknown" &&
                    tunneller.birthYear === null) ||
                  (filters.birthYear &&
                    filters.birthYear.length > 0 &&
                    tunneller.birthYear &&
                    filters.birthYear.includes(tunneller.birthYear));
                return birthYearMatch;
              })
              .filter((tunneller) => {
                const DeathYearMatch =
                  (filters.unknownDeathYear === "unknown" &&
                    tunneller.deathYear === null) ||
                  (filters.deathYear &&
                    filters.deathYear.length > 0 &&
                    tunneller.deathYear &&
                    filters.deathYear.includes(tunneller.deathYear));
                return DeathYearMatch;
              }),
          ])
          .filter(([, filteredTunnellers]) => filteredTunnellers.length > 0);

  const totalFilteredTunnellers = isFiltered(filters).reduce(
    (acc, [, tunnellers]) => acc + tunnellers.length,
    0,
  );
  const totalTunnellers = tunnellersList.reduce(
    (acc, [, tunnellers]) => acc + tunnellers.length,
    0,
  );

  const startBirthYear = filters.birthYear?.[0];
  const endBirthYear = filters.birthYear?.[filters.birthYear.length - 1];
  const startDeathYear = filters.deathYear?.[0];
  const endDeathYear = filters.deathYear?.[filters.deathYear.length - 1];

  const handleResetFilters = () => {
    if (isLoaded) {
      if (!isEqual(filters, filterList)) {
        setCurrentPage(1);
        setFilters(filterList);
      }
    }
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const HandleFilterButton = () => {
    setIsOpen(true);
  };

  const rollFiltersProps = {
    className: STYLES["filters-container"],
    uniqueDetachments,
    uniquecorps,
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

  const isDesktop = () => {
    return width && width > 896;
  };

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
        <div className={STYLES["roll-container"]}>
          <div className={STYLES.controls}>
            <div className={STYLES["results-container"]}>
              {isLoaded && (
                <button
                  className={STYLES["reset-button"]}
                  onClick={handleResetFilters}
                >
                  Reset filters
                </button>
              )}
              <p className={STYLES.results}>
                {isLoaded
                  ? `${totalFilteredTunnellers} result${totalFilteredTunnellers > 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>
            {isLoaded && (
              <button
                className={STYLES["filter-button"]}
                onClick={HandleFilterButton}
              >
                Filters
              </button>
            )}
            {isDesktop() ? <RollFilter {...rollFiltersProps} /> : null}
          </div>
          {isFiltered(filters).length > 0 ? (
            <RollAlphabet
              tunnellers={isFiltered(filters)}
              isLoaded={isLoaded}
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

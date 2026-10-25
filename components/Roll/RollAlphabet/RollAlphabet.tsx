"use client";

import { useTranslations } from "next-intl";

import { RollDetails } from "@/components/Roll/RollDetails/RollDetails";
import { Tunneller } from "@/types/tunnellers";

import STYLES from "./RollAlphabet.module.scss";

type Props = {
  tunnellers: [string, Tunneller[]][];
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function RollAlphabet({ tunnellers, currentPage, onPageChange }: Props) {
  const t = useTranslations("roll");
  const itemsPerPage = 25;

  const flattenedTunnellers = tunnellers.flatMap(([key, listOfTunnellers]) =>
    listOfTunnellers.map((tunneller) => ({ key, tunneller })),
  );

  const totalPages = Math.ceil(flattenedTunnellers.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTunnellers = flattenedTunnellers.slice(startIndex, endIndex);

  const groupedTunnellers = currentTunnellers.reduce(
    (acc, { key, tunneller }) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(tunneller);
      return acc;
    },
    {} as Record<string, Tunneller[]>,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  };

  type PaginationButton = { id: string; value: number | "..." };

  const getPaginationButtons = (): PaginationButton[] => {
    const buttons: PaginationButton[] = [];
    const pushPage = (value: number) =>
      buttons.push({ id: `page-${value}`, value });
    const pushEllipsis = (side: "leading" | "trailing") =>
      buttons.push({ id: `ellipsis-${side}`, value: "..." });
    const maxVisiblePages = 2;

    if (totalPages <= maxVisiblePages + 4) {
      for (let i = 1; i <= totalPages; i++) {
        pushPage(i);
      }
    } else {
      pushPage(1);

      if (currentPage > maxVisiblePages + 1) {
        pushEllipsis("leading");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pushPage(i);
      }

      if (currentPage < totalPages - maxVisiblePages) {
        pushEllipsis("trailing");
      }

      pushPage(totalPages);
    }

    return buttons;
  };

  return (
    <div className={STYLES.roll}>
      {Object.entries(groupedTunnellers).map(([key, listOfTunnellers]) => (
        <div id={`letter-${key}`} key={key}>
          <div className={STYLES["letter-container"]}>
            <h2
              className={STYLES.title}
              key={key}
              aria-label={t("letter", { letter: key })}
            >
              {key}
            </h2>
          </div>

          <div className={STYLES["tunnellers-container"]}>
            <RollDetails listOfTunnellers={listOfTunnellers} />
          </div>
        </div>
      ))}
      <div className={STYLES.pagination}>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={STYLES["pagination-main-button"]}
          aria-label={t("goToPreviousPage")}
        >
          <span className={STYLES["previous-arrow"]}>&#8227;</span>
        </button>
        {getPaginationButtons().map(({ id, value }) =>
          typeof value === "number" ? (
            <button
              key={id}
              disabled={value === currentPage}
              onClick={() => handlePageClick(value)}
              className={`${
                value === currentPage
                  ? STYLES.active
                  : STYLES["pagination-button"]
              }`}
              aria-label={t("goToPage", { page: value })}
            >
              {value}
            </button>
          ) : (
            <span
              key={id}
              className={STYLES["pagination-ellipsis"]}
              aria-hidden="true"
            >
              {value}
            </span>
          ),
        )}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={STYLES["pagination-main-button"]}
          aria-label={t("goToNextPage")}
        >
          &#8227;
        </button>
      </div>
    </div>
  );
}

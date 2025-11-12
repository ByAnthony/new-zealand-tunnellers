"use client";

import { RollDetails } from "@/components/Roll/RollDetails/RollDetails";
import { Tunneller } from "@/types/tunnellers";

import STYLES from "./RollAlphabet.module.scss";

type Props = {
  tunnellers: [string, Tunneller[]][];
  currentPage: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
};

export function RollAlphabet({ tunnellers, currentPage, onPageChange }: Props) {
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
      window.scrollTo(0, 0);
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      window.scrollTo(0, 0);
      onPageChange(currentPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 2;

    if (totalPages <= maxVisiblePages + 4) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);

      if (currentPage > maxVisiblePages + 1) {
        buttons.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }

      if (currentPage < totalPages - maxVisiblePages) {
        buttons.push("...");
      }

      buttons.push(totalPages);
    }

    return buttons;
  };

  return (
    <div className={STYLES.roll}>
      {Object.entries(groupedTunnellers).map(([key, listOfTunnellers]) => (
        <div id={`letter-${key}`} key={key}>
          <div className={STYLES["letter-container"]}>
            <h2 className={STYLES.title} key={key} aria-label={`Letter ${key}`}>
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
          aria-label="Go to previous page"
        >
          <span className={STYLES["previous-arrow"]}>&#8227;</span>
        </button>
        {getPaginationButtons().map((button, index) =>
          typeof button === "number" ? (
            <button
              key={index}
              disabled={button === currentPage}
              onClick={() => handlePageClick(button)}
              className={`${
                button === currentPage
                  ? STYLES.active
                  : STYLES["pagination-button"]
              }`}
              aria-label={`Go to page ${button}`}
            >
              {button}
            </button>
          ) : (
            <span
              key={index}
              className={STYLES["pagination-ellipsis"]}
              aria-hidden="true"
            >
              {button}
            </span>
          ),
        )}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={STYLES["pagination-main-button"]}
          aria-label="Go to next page"
        >
          &#8227;
        </button>
      </div>
    </div>
  );
}

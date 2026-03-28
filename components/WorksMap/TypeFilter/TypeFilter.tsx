import { useRef, useState, useEffect, useCallback } from "react";

import STYLES from "./TypeFilter.module.scss";

type Props = {
  types: string[];
  selectedTypes: Set<string>;
  onToggle: (_type: string) => void;
  colors: Record<string, string>;
};

export function TypeFilter({ types, selectedTypes, onToggle, colors }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows]);

  const scroll = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 150, behavior: "smooth" });
  };

  return (
    <div className={STYLES["type-filter"]}>
      <button
        className={STYLES.arrow}
        aria-label="Scroll filters left"
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
      >
        &larr;
      </button>
      <div
        className={STYLES.chips}
        role="group"
        aria-label="Filter by type"
        ref={scrollRef}
      >
        {types.map((type) => {
          const isActive = selectedTypes.has(type);
          return (
            <button
              key={type}
              className={`${STYLES.chip} ${isActive ? STYLES["chip--active"] : ""}`}
              aria-pressed={isActive}
              onClick={() => onToggle(type)}
              style={
                isActive
                  ? { backgroundColor: colors[type], borderColor: colors[type] }
                  : undefined
              }
            >
              <span
                className={STYLES["chip-dot"]}
                style={{ backgroundColor: colors[type] }}
              />
              {type}
            </button>
          );
        })}
      </div>
      <button
        className={STYLES.arrow}
        aria-label="Scroll filters right"
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
      >
        &rarr;
      </button>
    </div>
  );
}

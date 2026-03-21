import { useState, useEffect, useRef } from "react";

import STYLES from "./TypeFilter.module.scss";
import "rc-slider/assets/index.css";

type Props = {
  types: string[];
  selectedType: string | null;
  onChange: (_value: string | null) => void;
  onOpen?: () => void;
};

export function TypeFilter({ types, selectedType, onChange, onOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div className={STYLES["type-filter"]} ref={containerRef}>
      <button
        className={`${STYLES["type-filter-trigger"]} ${selectedType ? STYLES["type-filter-trigger--active"] : ""}`}
        onClick={() => {
          if (!isOpen) onOpen?.();
          setIsOpen((prev) => !prev);
        }}
      >
        {selectedType ?? "All types"}
      </button>
      {isOpen && (
        <div className={STYLES["type-filter-options"]}>
          <button
            className={
              !selectedType ? STYLES["type-filter-option--active"] : ""
            }
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            All types
          </button>
          {types.map((type) => (
            <button
              key={type}
              className={
                selectedType === type
                  ? STYLES["type-filter-option--active"]
                  : ""
              }
              onClick={() => {
                onChange(type);
                setIsOpen(false);
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

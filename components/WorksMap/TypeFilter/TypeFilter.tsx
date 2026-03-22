import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";

import STYLES from "./TypeFilter.module.scss";

type Props = {
  types: string[];
  selectedType: string | null;
  onChange: (_value: string | null) => void;
  onOpen?: () => void;
};

export function TypeFilter({ types, selectedType, onChange, onOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          onOpen?.();
          setIsOpen(true);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const buttons =
          optionsRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons) return;
        const focused = Array.from(buttons).indexOf(
          document.activeElement as HTMLButtonElement,
        );
        const next =
          e.key === "ArrowDown"
            ? Math.min(focused + 1, buttons.length - 1)
            : Math.max(focused - 1, 0);
        buttons[next]?.focus();
      }
    },
    [isOpen, close, onOpen],
  );

  const listboxId = "type-filter-options";

  return (
    <div
      className={STYLES["type-filter"]}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className={`${STYLES["type-filter-trigger"]} ${selectedType ? STYLES["type-filter-trigger--active"] : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          if (!isOpen) onOpen?.();
          setIsOpen((prev) => !prev);
        }}
      >
        {selectedType ?? "All types"}
      </button>
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Filter by type"
          className={STYLES["type-filter-options"]}
          ref={optionsRef}
        >
          <button
            role="option"
            aria-selected={!selectedType}
            className={
              !selectedType ? STYLES["type-filter-option--active"] : ""
            }
            onClick={() => {
              onChange(null);
              close();
            }}
          >
            All types
          </button>
          {types.map((type) => (
            <button
              key={type}
              role="option"
              aria-selected={selectedType === type}
              className={
                selectedType === type
                  ? STYLES["type-filter-option--active"]
                  : ""
              }
              onClick={() => {
                onChange(type);
                close();
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

import { useTranslations } from "next-intl";

import STYLES from "./TypeFilter.module.scss";

type Props = {
  types: string[];
  selectedTypes: Set<string>;
  availableTypes?: Set<string>;
  onToggle: (_type: string) => void;
  colors: Record<string, string>;
};

export function TypeFilter({
  types,
  selectedTypes,
  availableTypes,
  onToggle,
  colors,
}: Props) {
  const t = useTranslations("maps");

  const chips = types.map((type) => {
    const isActive = selectedTypes.has(type);
    const isDisabled =
      availableTypes !== undefined && !availableTypes.has(type);
    const isInactiveSelected = isActive && isDisabled;
    const className = [
      STYLES.chip,
      isActive ? STYLES["chip--active"] : null,
      isDisabled ? STYLES["chip--disabled"] : null,
      isInactiveSelected ? STYLES["chip--inactive-selected"] : null,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        key={type}
        className={className}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={() => onToggle(type)}
      >
        <span
          className={STYLES["chip-dot"]}
          style={{ backgroundColor: colors[type] }}
        />
        {type}
      </button>
    );
  });

  return (
    <div
      className={STYLES["chips-wrapped"]}
      role="group"
      aria-label={t("filterByType")}
    >
      {chips}
    </div>
  );
}

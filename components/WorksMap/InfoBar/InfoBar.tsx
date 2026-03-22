import { WorkData } from "@/utils/database/queries/worksQuery";

import STYLES from "./InfoBar.module.scss";

type Props = {
  work: WorkData;
  isExiting: boolean;
  animType?: "default" | "fade" | "slide-next" | "slide-prev";
  locale: string;
  onClose: () => void;
  stackTotal?: number;
  stackIndex?: number;
  onNavigate?: (direction: 1 | -1) => void;
};

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(
    locale === "en" ? "en-GB" : locale,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function getAnimClass(
  isExiting: boolean,
  animType: Props["animType"],
  styles: Record<string, string>,
) {
  if (animType === "fade")
    return isExiting ? styles["fade-exit"] : styles["fade-enter"];
  if (animType === "slide-next")
    return isExiting ? styles["slide-next-exit"] : styles["slide-next-enter"];
  if (animType === "slide-prev")
    return isExiting ? styles["slide-prev-exit"] : styles["slide-prev-enter"];
  return isExiting ? styles.exit : styles.enter;
}

export function InfoBar({
  work,
  isExiting,
  animType = "default",
  locale,
  onClose,
  stackTotal,
  stackIndex,
  onNavigate,
}: Props) {
  const type = locale === "fr" ? work.work_type_fr : work.work_type_en;
  const category1 =
    locale === "fr" ? work.work_category_1_fr : work.work_category_1_en;
  const category2 =
    locale === "fr" ? work.work_category_2_fr : work.work_category_2_en;
  const categories = [category1, category2].filter(Boolean) as string[];
  const typeLabel = type ?? (categories.length === 1 ? categories[0] : null);

  const dateStart = work.work_date_start;
  const dateEnd = work.work_date_end;
  // End date may be before start due to data entry errors — always display in chronological order
  const hasTwoDates = dateStart && dateEnd && dateEnd !== dateStart;
  const [displayStart, displayEnd] =
    hasTwoDates && dateEnd < dateStart
      ? [dateEnd, dateStart]
      : [dateStart ?? "", dateEnd ?? dateStart ?? ""];

  return (
    <div
      className={`${STYLES["info-bar"]} ${getAnimClass(isExiting, animType, STYLES)}`}
    >
      <div className={STYLES["info-bar-fields"]}>
        <div className={STYLES["info-bar-field"]}>
          <span className={STYLES["info-bar-value"]}>{work.work_name}</span>
          {(typeLabel || categories.length > 1) &&
            (() => {
              const items = typeLabel
                ? typeLabel
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : categories;
              return (
                <div
                  className={`${STYLES["info-bar-field"]} ${STYLES["info-bar-field--full"]}`}
                >
                  {items.length > 1 ? (
                    <ul className={STYLES["info-bar-list"]}>
                      {items.map((item) => (
                        <li key={item} className={STYLES["info-bar-value"]}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className={STYLES["info-bar-value"]}>{items[0]}</span>
                  )}
                </div>
              );
            })()}
        </div>
        {dateStart && (
          <div className={STYLES["info-bar-dates"]}>
            <div className={STYLES["info-bar-field"]}>
              <span className={STYLES["info-bar-label"]}>
                {hasTwoDates ? "Start" : "Date"}
              </span>
              <span className={STYLES["info-bar-value"]}>
                {formatDate(displayStart, locale)}
              </span>
            </div>
            {hasTwoDates && (
              <div className={STYLES["info-bar-field"]}>
                <span className={STYLES["info-bar-label"]}>End</span>
                <span className={STYLES["info-bar-value"]}>
                  {formatDate(displayEnd, locale)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={STYLES["info-bar-actions"]}>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
        {stackTotal && stackTotal > 1 && (
          <div className={STYLES["info-bar-nav"]}>
            <button onClick={() => onNavigate?.(-1)} aria-label="Previous">
              ‹
            </button>
            <span>
              {(stackIndex ?? 0) + 1}/{stackTotal}
            </span>
            <button onClick={() => onNavigate?.(1)} aria-label="Next">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

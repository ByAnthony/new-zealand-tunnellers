import { WorkData } from "@/utils/database/queries/worksQuery";

import STYLES from "./InfoBar.module.scss";

type Props = {
  work: WorkData;
  isExiting: boolean;
  locale: string;
  onClose: () => void;
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

export function InfoBar({ work, isExiting, locale, onClose }: Props) {
  const type = locale === "fr" ? work.work_type_fr : work.work_type_en;
  const category1 =
    locale === "fr" ? work.work_category_1_fr : work.work_category_1_en;
  const category2 =
    locale === "fr" ? work.work_category_2_fr : work.work_category_2_en;
  const categories = [category1, category2].filter(Boolean) as string[];
  const typeLabel = type ?? (categories.length === 1 ? categories[0] : null);

  const a = work.work_date_start;
  const b = work.work_date_end;
  const hasTwoDates = a && b && b !== a;
  const [first, last] = hasTwoDates && b < a ? [b, a] : [a ?? "", b ?? a ?? ""];

  return (
    <div
      className={`${STYLES["info-bar"]} ${isExiting ? STYLES.exit : STYLES.enter}`}
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
        {a && (
          <div className={STYLES["info-bar-dates"]}>
            <div className={STYLES["info-bar-field"]}>
              <span className={STYLES["info-bar-label"]}>
                {hasTwoDates ? "Start" : "Date"}
              </span>
              <span className={STYLES["info-bar-value"]}>
                {formatDate(first, locale)}
              </span>
            </div>
            {hasTwoDates && (
              <div className={STYLES["info-bar-field"]}>
                <span className={STYLES["info-bar-label"]}>End</span>
                <span className={STYLES["info-bar-value"]}>
                  {formatDate(last, locale)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <button onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

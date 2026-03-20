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
        </div>
        {type && (
          <div className={STYLES["info-bar-field"]}>
            <span className={STYLES["info-bar-label"]}>Type</span>
            <span className={STYLES["info-bar-value"]}>{type}</span>
          </div>
        )}
        {work.work_section && (
          <div className={STYLES["info-bar-field"]}>
            <span className={STYLES["info-bar-label"]}>Section</span>
            <span className={STYLES["info-bar-value"]}>
              {work.work_section}
            </span>
          </div>
        )}
        {a && hasTwoDates ? (
          <div className={STYLES["info-bar-dates"]}>
            <div className={STYLES["info-bar-field"]}>
              <span className={STYLES["info-bar-label"]}>Start</span>
              <span className={STYLES["info-bar-value"]}>
                {formatDate(first, locale)}
              </span>
            </div>
            <div className={STYLES["info-bar-field"]}>
              <span className={STYLES["info-bar-label"]}>End</span>
              <span className={STYLES["info-bar-value"]}>
                {formatDate(last, locale)}
              </span>
            </div>
          </div>
        ) : a ? (
          <div
            className={`${STYLES["info-bar-field"]} ${STYLES["info-bar-field--full"]}`}
          >
            <span className={STYLES["info-bar-label"]}>Date</span>
            <span className={STYLES["info-bar-value"]}>
              {formatDate(first, locale)}
            </span>
          </div>
        ) : null}
      </div>
      <button onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

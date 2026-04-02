import { useTranslations } from "next-intl";

import { CaveData } from "@/utils/database/queries/cavesQuery";
import { WorkData } from "@/utils/database/queries/worksQuery";

import STYLES from "./InfoBar.module.scss";

type Props = {
  work: WorkData | null;
  cave?: CaveData | null;
  isExiting: boolean;
  animType?: "default" | "fade" | "slide-next" | "slide-prev";
  locale: string;
  colors: Record<string, string>;
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
  cave,
  isExiting,
  animType = "default",
  locale,
  colors,
  onClose,
  stackTotal,
  stackIndex,
  onNavigate,
}: Props) {
  const t = useTranslations("maps");

  if (cave) {
    const name = locale === "fr" ? cave.cave_name_fr : cave.cave_name_en;
    const typeLabel = locale === "fr" ? cave.cave_type_fr : cave.cave_type_en;
    return (
      <div
        className={`${STYLES["info-bar"]} ${getAnimClass(isExiting, animType, STYLES)}`}
      >
        <div className={STYLES["info-bar-fields"]}>
          <div className={STYLES["info-bar-header"]}>
            <span className={STYLES["info-bar-name"]}>{name}</span>
            <span className={STYLES["info-bar-type-label"]}>{typeLabel}</span>
          </div>
          <div className={STYLES["info-bar-details"]}>
            <div className={STYLES["info-bar-field"]}>
              <span className={STYLES["info-bar-label"]}>
                {t("coordinates")}
              </span>
              <span className={STYLES["info-bar-value"]}>
                {Number(cave.cave_latitude).toFixed(6)},{" "}
                {Number(cave.cave_longitude).toFixed(6)}
              </span>
            </div>
          </div>
        </div>
        <div className={STYLES["info-bar-actions"]}>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!work) return null;

  const type = locale === "fr" ? work.work_type_fr : work.work_type_en;
  const category1 =
    locale === "fr" ? work.work_category_1_fr : work.work_category_1_en;
  const category2 =
    locale === "fr" ? work.work_category_2_fr : work.work_category_2_en;
  const categories = [category1, category2].filter(Boolean) as string[];
  const typeItems = type
    ? type
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const labels =
    typeItems.length > 0
      ? typeItems.map((text, i) => ({
          text,
          colorKey: categories[i] ?? categories[0],
        }))
      : categories.map((cat) => ({ text: cat, colorKey: cat }));

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
        <div className={STYLES["info-bar-header"]}>
          <span className={STYLES["info-bar-name"]}>{work.work_name}</span>
          {labels.length > 0 && (
            <div className={STYLES["info-bar-tags"]}>
              {labels.map((label) => (
                <span
                  key={label.text}
                  className={STYLES["info-bar-tag"]}
                  style={{
                    backgroundColor: colors[label.colorKey],
                    borderColor: colors[label.colorKey],
                  }}
                >
                  {label.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={STYLES["info-bar-details"]}>
          {dateStart && (
            <div className={STYLES["info-bar-row"]}>
              <div className={STYLES["info-bar-field"]}>
                <span className={STYLES["info-bar-label"]}>
                  {hasTwoDates ? t("start") : t("date")}
                </span>
                <span className={STYLES["info-bar-value"]}>
                  {formatDate(displayStart, locale)}
                </span>
              </div>
              {hasTwoDates && (
                <div className={STYLES["info-bar-field"]}>
                  <span className={STYLES["info-bar-label"]}>{t("end")}</span>
                  <span className={STYLES["info-bar-value"]}>
                    {formatDate(displayEnd, locale)}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={STYLES["info-bar-field"]}>
            <span className={STYLES["info-bar-label"]}>{t("coordinates")}</span>
            <span className={STYLES["info-bar-value"]}>
              {Number(work.work_latitude).toFixed(6)},{" "}
              {Number(work.work_longitude).toFixed(6)}
            </span>
          </div>
        </div>
      </div>
      <div className={STYLES["info-bar-actions"]}>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
        {stackTotal && stackTotal > 1 && (
          <div className={STYLES["info-bar-nav"]}>
            <span>
              <strong>{(stackIndex ?? 0) + 1}</strong>
              &nbsp;/&nbsp;
              {stackTotal}
            </span>
            <button onClick={() => onNavigate?.(1)} aria-label="Next">
              &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

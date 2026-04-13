import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import STYLES from "./Resources.module.scss";

export function Resources() {
  const t = useTranslations("homepage");
  const tMaps = useTranslations("maps");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return (
    <section
      id="resources"
      className={STYLES.container}
      aria-labelledby="resources-title"
    >
      <h2 id="resources-title">{t("resources")}</h2>
      <div className={STYLES.actions}>
        <Link
          href={`${localePrefix}/maps/tunnellers-works`}
          className={STYLES.card}
        >
            <div className={STYLES["card-content"]}>
              <div className={STYLES["card-header"]}>
              <h3 className={STYLES.title}>{tMaps("mapTitle")}</h3>
              <div className={STYLES.badge}>{tMaps("mapBadge")}</div>
            </div>
            <p className={STYLES.description}>{tMaps("mapDescription")}</p>
          </div>
          <div className={STYLES["button-base"]}>
            <div className={STYLES.arrow} style={{ marginLeft: "auto" }}>
              &rarr;
            </div>
          </div>
        </Link>
        <Link
          href={`${localePrefix}/books/kiwis-dig-tunnels-too`}
          className={STYLES.card}
        >
            <div className={STYLES["card-content"]}>
              <div className={STYLES["card-header"]}>
              <h3 className={STYLES.title}>{t("bookTitle")}</h3>
              <div className={STYLES.badge}>{t("bookBadge")}</div>
              </div>
            <p className={STYLES.description}>{t("bookDescription")}</p>
          </div>
          <div className={STYLES["button-base"]}>
            <div>
              <span className={STYLES.by}>{t("bookBy")}</span>
              <span className={STYLES.author}>Anthony Byledbal</span>
            </div>
            <div className={STYLES.arrow}>&rarr;</div>
          </div>
        </Link>
      </div>
    </section>
  );
}

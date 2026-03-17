import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import STYLES from "./Resources.module.scss";

export function Resources() {
  const t = useTranslations("homepage");
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
          href={`${localePrefix}/books/kiwis-dig-tunnels-too`}
          className={STYLES.card}
        >
          <div className={STYLES["card-content"]}>
            <div className={STYLES["card-header"]}>
              <h3 className={STYLES.title}>{t("resourceTitle")}</h3>
              <div className={STYLES.badge}>{t("resourceBadge")}</div>
            </div>
            <p className={STYLES.description}>{t("resourceDescription")}</p>
          </div>
          <div className={STYLES["button-base"]}>
            <div>
              <span className={STYLES.by}>{t("resourceBy")}</span>
              <span className={STYLES.author}>Anthony Byledbal</span>
            </div>
            <div className={STYLES.arrow}>&rarr;</div>
          </div>
        </Link>
      </div>
    </section>
  );
}

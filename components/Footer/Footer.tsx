"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import STYLES from "./Footer.module.scss";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const pathname = usePathname();

  if (
    pathname.endsWith("/maps/tunnellers-works") ||
    pathname.endsWith("/maps/tunnellers-works/")
  )
    return null;

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className={STYLES.footer}>
      <div className={STYLES.map}>
        <div className={STYLES.links}>
          <div className={STYLES["map-link"]}>
            <Link href={`${localePrefix}/#history`}>{tNav("history")}</Link>
          </div>
          <div className={STYLES["map-link"]}>
            <Link href={`${localePrefix}/tunnellers`}>
              {tNav("tunnellers")}
            </Link>
          </div>
          <div className={STYLES["map-link"]}>
            <Link href={`${localePrefix}/#resources`}>{tNav("resources")}</Link>
          </div>
          <div className={STYLES["map-link"]}>
            <Link href={`${localePrefix}/about-us`}>{tNav("aboutUs")}</Link>
          </div>
        </div>
        <button
          type="button"
          className={STYLES["scroll-top"]}
          onClick={handleClick}
          aria-label={t("scrollToTop")}
        >
          &uarr;
        </button>
      </div>
      <div className={STYLES.support}>
        <div>
          <Link
            href="https://www.univ-artois.fr/artois-university"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("artoisUniversityAria")}
          >
            <Image
              src="/images/support/logo-univ-artois-blanc_0.png"
              alt={t("artoisUniversityAlt")}
              width={125}
              height={67}
              className={STYLES["support-logo"]}
              placeholder="empty"
            />
          </Link>
        </div>
        <div>
          <Link
            href="https://www.irsem.fr/en/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("irsemAria")}
          >
            <Image
              src="/images/support/irsem-white.png"
              alt={t("irsemAlt")}
              width={125}
              height={81}
              className={STYLES["support-logo"]}
              placeholder="empty"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { forwardRef } from "react";

import STYLES from "./NavigationDialog.module.scss";

type NavigationDialogProps = {
  onNavigate: (href: string) => void;
  onClose: () => void;
};

const ROLL_MAP_QUERY_PARAMS = ["view", "lat", "lng", "origin", "zoom"];

function getLocaleSwitchQueryString(): string {
  const params = new URLSearchParams(window.location.search);
  const isOriginMapMounted =
    document.querySelector('[data-testid="roll-origin-map"]') !== null;

  if (!isOriginMapMounted) {
    ROLL_MAP_QUERY_PARAMS.forEach((param) => params.delete(param));
  }

  const qs = params.toString().replace(/%2C/gi, ",");
  return qs ? `?${qs}` : "";
}

export const NavigationDialog = forwardRef<
  HTMLDialogElement,
  NavigationDialogProps
>(({ onClose, onNavigate }, ref) => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const pathname = usePathname();
  const router = useRouter();
  const switchLocaleBasePath =
    locale === "en" ? `/fr${pathname}` : pathname.replace(/^\/fr/, "") || "/";
  const switchLocaleBase = switchLocaleBasePath.endsWith("/")
    ? switchLocaleBasePath
    : `${switchLocaleBasePath}/`;
  const historyHref = `${localePrefix}/#history`;
  const tunnellersWorksHref = `${localePrefix}/history/tunnellers-works`;
  const tunnellersHref = `${localePrefix}/tunnellers`;
  const tunnellersOriginHref = `${localePrefix}/tunnellers/?view=map`;
  const bookHref = `${localePrefix}/kiwis-dig-tunnels-too`;
  const aboutHref = `${localePrefix}/about-us`;

  return (
    <dialog
      ref={ref}
      className={STYLES["navigation-dialog"]}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={STYLES["navigation-dialog__header"]}>
        <Link
          href={switchLocaleBase}
          className={STYLES["language-switcher"]}
          onClick={(e) => {
            e.preventDefault();
            const qs = getLocaleSwitchQueryString();
            const href = qs ? `${switchLocaleBase}${qs}` : switchLocaleBase;
            onNavigate(href);
            router.push(href);
          }}
        >
          {locale === "en" ? "Français" : "English"}
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className={STYLES["navigation-dialog__close"]}
        >
          <span className={STYLES["navigation-dialog__close-line"]} />
          <span className={STYLES["navigation-dialog__close-line"]} />
          <span className={STYLES["navigation-dialog__close-line"]} />
        </button>
      </div>

      <nav className={STYLES["menu-nav"]}>
        <div className={STYLES["menu-row"]}>
          <Link
            href={historyHref}
            className={STYLES["menu-primary"]}
            onClick={() => onNavigate(historyHref)}
          >
            {t("history")}
          </Link>
          <span className={STYLES["menu-connector"]} />
          <Link
            href={tunnellersWorksHref}
            className={STYLES["menu-secondary"]}
            onClick={() => onNavigate(tunnellersWorksHref)}
          >
            <span className={STYLES["map-label"]}>{t("map")}</span>
            {t("tunnellersWorks")}
            <span className={STYLES.arrow}>&rarr;</span>
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={tunnellersHref}
            className={STYLES["menu-primary"]}
            onClick={() => onNavigate(tunnellersHref)}
          >
            {t("tunnellers")}
          </Link>
          <span className={STYLES["menu-connector"]} />
          <Link
            href={tunnellersOriginHref}
            className={STYLES["menu-secondary"]}
            onClick={() => onNavigate(tunnellersOriginHref)}
          >
            <span className={STYLES["map-label"]}>{t("map")}</span>
            {t("tunnellersOrigin")}
            <span className={STYLES.arrow}>&rarr;</span>
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={bookHref}
            className={STYLES["menu-primary"]}
            onClick={() => onNavigate(bookHref)}
          >
            {t("book")}
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={aboutHref}
            className={STYLES["menu-primary"]}
            onClick={() => onNavigate(aboutHref)}
          >
            {t("aboutUs")}
          </Link>
        </div>
      </nav>
    </dialog>
  );
});

NavigationDialog.displayName = "NavigationDialog";

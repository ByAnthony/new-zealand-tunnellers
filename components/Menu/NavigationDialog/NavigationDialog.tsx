import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { forwardRef } from "react";

import STYLES from "./NavigationDialog.module.scss";

type NavigationDialogProps = {
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
>(({ onClose }, ref) => {
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

  return (
    <dialog ref={ref} className={STYLES["navigation-dialog"]}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className={STYLES["navigation-dialog__close"]}
      >
        ×
      </button>
      <nav className={STYLES["menu-nav"]}>
        <div className={STYLES["menu-row"]}>
          <Link
            href={`${localePrefix}/#history`}
            className={STYLES["menu-primary"]}
            onClick={onClose}
          >
            {t("history")}
          </Link>

          <Link
            href={`${localePrefix}/history/tunnellers-works`}
            className={STYLES["menu-secondary"]}
            onClick={onClose}
          >
            {t("tunnellersWorks")}
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={`${localePrefix}/tunnellers`}
            className={STYLES["menu-primary"]}
            onClick={onClose}
          >
            {t("tunnellers")}
          </Link>

          <Link
            href={`${localePrefix}/tunnellers/?view=map`}
            className={STYLES["menu-secondary"]}
            onClick={onClose}
          >
            {t("tunnellersOrigin")}
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={`${localePrefix}/kiwis-dig-tunnels-too`}
            className={STYLES["menu-primary"]}
            onClick={onClose}
          >
            {t("book")}
          </Link>
        </div>

        <div className={STYLES["menu-row"]}>
          <Link
            href={`${localePrefix}/about-us`}
            className={STYLES["menu-primary"]}
            onClick={onClose}
          >
            {t("aboutUs")}
          </Link>
        </div>

        <Link
          href={switchLocaleBase}
          className={STYLES["language-switcher"]}
          onClick={(e) => {
            e.preventDefault();
            const qs = getLocaleSwitchQueryString();
            router.push(qs ? `${switchLocaleBase}${qs}` : switchLocaleBase);
          }}
        >
          {locale === "en" ? "Français" : "English"}
        </Link>
      </nav>
    </dialog>
  );
});

NavigationDialog.displayName = "NavigationDialog";

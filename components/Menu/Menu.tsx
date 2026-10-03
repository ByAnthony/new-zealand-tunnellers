"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Tunneller } from "@/types/tunnellers";
import { displayBiographyDates } from "@/utils/helpers/roll";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Menu.module.scss";
import { NavigationDialog } from "./NavigationDialog/NavigationDialog";

const MENU_TOGGLE_ANIMATION_MS = 1000;
const NAVIGATION_COVER_DELAY_MS = 500;
let lockedPageScrollY = 0;

type Props = {
  tunnellers: Tunneller[];
};

const setPageScrollLock = (
  isLocked: boolean,
  { restoreScroll = true } = {},
) => {
  if (isLocked) {
    lockedPageScrollY = window.scrollY;
    document.body.style.overflowY = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedPageScrollY}px`;
    document.body.style.width = "100%";
    return;
  }

  const scrollY = lockedPageScrollY;
  document.body.style.overflowY = "visible";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  if (restoreScroll) {
    window.scrollTo(0, scrollY);
  }
};

const scrollToHashTarget = (hash: string) => {
  const targetId = decodeURIComponent(hash.replace(/^#/, ""));
  document.getElementById(targetId)?.scrollIntoView();
};

export function Menu({ tunnellers }: Props) {
  const t = useTranslations("menu");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const { width } = useWindowDimensions();
  const divRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [menuVisible, setMenuVisible] = useState(true);
  const [filteredTunnellers, setFilteredTunnellers] = useState<Tunneller[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState("auto");
  const [isMenuToggleReturning, setIsMenuToggleReturning] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setMenuVisible(prevScrollPos > currentScrollPos);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownVisible(false);
      if (event.key === "Enter") {
        if (!dropdownVisible && filteredTunnellers.length > 0) {
          setDropdownVisible(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownVisible, filteredTunnellers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        divRef.current &&
        searchFormRef.current &&
        !divRef.current.contains(event.target as Node) &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const availableHeight = window.visualViewport.height - 100;
        setDropdownMaxHeight(`${availableHeight}px`);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();
    return () =>
      window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (search: string) => {
    const searchParts = search.toLowerCase().split(" ");

    setFilteredTunnellers(
      search.length > 0
        ? tunnellers.filter((tunneller: Tunneller) => {
            const fullName = tunneller.search.fullName?.toLowerCase() ?? "";
            return searchParts.every((part) => fullName.includes(part));
          })
        : [],
    );

    setDropdownVisible(search.length > 0);
  };

  const handleSearchInteraction = () => {
    if (!dropdownVisible) {
      setDropdownVisible(filteredTunnellers.length > 0);
    }
  };

  const handleClearSearch = () => {
    setDropdownVisible(false);
    setFilteredTunnellers([]);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleNavigation = () => {
    setDropdownVisible(false);
  };

  const isMobileOrTablet = () => {
    return width && width < 896;
  };

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const menuToggleAnimationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const pathname = usePathname();

  const clearCloseDelayTimeout = () => {
    if (closeDelayTimeoutRef.current) {
      clearTimeout(closeDelayTimeoutRef.current);
      closeDelayTimeoutRef.current = null;
    }
  };

  const clearMenuToggleAnimationTimeout = () => {
    if (menuToggleAnimationTimeoutRef.current) {
      clearTimeout(menuToggleAnimationTimeoutRef.current);
      menuToggleAnimationTimeoutRef.current = null;
    }
  };

  const animateMenuToggleReturn = () => {
    clearMenuToggleAnimationTimeout();
    setIsMenuToggleReturning(true);
    menuToggleAnimationTimeoutRef.current = setTimeout(() => {
      setIsMenuToggleReturning(false);
      menuToggleAnimationTimeoutRef.current = null;
    }, MENU_TOGGLE_ANIMATION_MS);
  };

  const finishCloseMenu = ({
    animateToggle = true,
    hashTarget,
  }: {
    animateToggle?: boolean;
    hashTarget?: string;
  } = {}) => {
    dialogRef.current?.close?.();
    dialogRef.current?.removeAttribute("open");
    setPageScrollLock(false, { restoreScroll: !hashTarget });

    if (hashTarget) {
      scrollToHashTarget(hashTarget);
    }

    if (animateToggle) {
      animateMenuToggleReturn();
    }
  };

  const openMenu = () => {
    clearCloseDelayTimeout();
    clearMenuToggleAnimationTimeout();
    setIsMenuToggleReturning(false);
    dialogRef.current?.showModal?.();
    dialogRef.current?.setAttribute("open", "");
    setPageScrollLock(true);
  };

  const closeMenu = () => {
    if (!dialogRef.current?.open) return;

    clearCloseDelayTimeout();
    finishCloseMenu();
  };

  const closeMenuAfterNavigationDelay = (hashTarget?: string) => {
    clearCloseDelayTimeout();
    closeDelayTimeoutRef.current = setTimeout(() => {
      closeDelayTimeoutRef.current = null;
      if (!dialogRef.current?.open) return;

      finishCloseMenu({ hashTarget });
    }, NAVIGATION_COVER_DELAY_MS);
  };

  const normalizePathname = (value: string) =>
    value.length > 1 ? value.replace(/\/$/, "") : value;

  const handleDialogNavigation = (href: string) => {
    const targetUrl = new URL(href, window.location.origin);

    if (normalizePathname(targetUrl.pathname) === normalizePathname(pathname)) {
      closeMenuAfterNavigationDelay(targetUrl.hash || undefined);
      return;
    }

    clearCloseDelayTimeout();
  };

  useEffect(() => {
    const hashTarget = window.location.hash || undefined;

    clearCloseDelayTimeout();
    dialogRef.current?.close?.();
    dialogRef.current?.removeAttribute("open");
    setPageScrollLock(false, { restoreScroll: !hashTarget });

    if (hashTarget) {
      requestAnimationFrame(() => scrollToHashTarget(hashTarget));
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearCloseDelayTimeout();
      clearMenuToggleAnimationTimeout();
      setPageScrollLock(false);
    };
  }, []);

  return (
    <div
      data-testid="menu"
      className={`${STYLES.menu} ${menuVisible ? "" : STYLES.hidden}`}
    >
      <Link
        href={`${localePrefix}/`}
        className={STYLES.logo}
        aria-label={tNav("goToHomepage")}
      >
        <Image
          src="/nzt_logo.png"
          className={STYLES["logo-image"]}
          alt={tNav("logoAlt")}
          width={30}
          height={30}
          priority
          placeholder="empty"
        />
      </Link>

      <div className={STYLES["search-form-container"]}>
        <div
          className={STYLES["search-form"]}
          onClick={handleSearchInteraction}
          ref={searchFormRef}
        >
          <input
            disabled={!menuVisible}
            id="search"
            ref={inputRef}
            type="text"
            aria-label={t("searchAlt")}
            placeholder={t("searchPlaceholder")}
            value={query}
            onFocus={handleSearchInteraction}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              handleSearch(value);
            }}
          />

          {query !== "" ? (
            <button
              className={STYLES["clear-search-container"]}
              onClick={handleClearSearch}
              aria-label={t("clearSearch")}
            >
              <div className={STYLES["clear-search"]} aria-hidden="true">
                +
              </div>
            </button>
          ) : (
            <Image
              src="/search.png"
              alt={t("searchAlt")}
              width={20}
              height={20}
              className={STYLES["search-form-button"]}
              priority
              placeholder="empty"
            />
          )}
        </div>

        {dropdownVisible && filteredTunnellers.length > 0 && (
          <div
            className={STYLES.dropdown}
            ref={divRef}
            data-testid="dropdown"
            style={{
              maxHeight: isMobileOrTablet() ? dropdownMaxHeight : "343px",
            }}
          >
            <ul>
              {filteredTunnellers.map((tunneller, index) => (
                <li key={index}>
                  <Link
                    href={`${localePrefix}/tunnellers/${tunneller.slug}/`}
                    aria-label={t("seeTunnellerProfile", {
                      forename: tunneller.name.forename,
                      surname: tunneller.name.surname,
                    })}
                    onClick={handleNavigation}
                  >
                    <p>
                      {tunneller.name.forename}
                      <span className={STYLES.surname}>
                        {` ${tunneller.name.surname} `}
                      </span>
                      <span className={STYLES.dates}>
                        (
                        {displayBiographyDates(
                          tunneller.birthYear,
                          tunneller.deathYear,
                        )}
                        )
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={`${localePrefix}/tunnellers/`}
              className={STYLES["tunnellers-link"]}
              onClick={handleNavigation}
            >
              <div className={STYLES["tunnellers-link-display"]}>
                <div>{t("seeAllTunnellers")}</div>
                <div className={STYLES.arrow}>&rarr;</div>
              </div>
            </Link>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openMenu}
        aria-label={t("openMenu")}
        className={STYLES["menu-toggle"]}
        data-menu-closed={isMenuToggleReturning ? "true" : undefined}
      >
        <span className={STYLES["menu-toggle__line-1"]} />
        <span className={STYLES["menu-toggle__line-2"]} />
        <span className={STYLES["menu-toggle__line-3"]} />
      </button>
      <NavigationDialog
        ref={dialogRef}
        onNavigate={handleDialogNavigation}
        onClose={closeMenu}
      />
    </div>
  );
}

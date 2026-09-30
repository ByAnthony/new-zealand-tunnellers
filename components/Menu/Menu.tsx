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

type Props = {
  tunnellers: Tunneller[];
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
  const pathname = usePathname();

  const openMenu = () => {
    dialogRef.current?.showModal();
  };

  const closeMenu = () => {
    dialogRef.current?.close();
  };

  // ponytail: close on route change (not on link click) so the dialog stays
  // up during the transition instead of flashing the old page underneath.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

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
        aria-label="Open menu"
        className={STYLES["menu-toggle"]}
      >
        <span className={STYLES["menu-toggle__line-1"]} />
        <span className={STYLES["menu-toggle__line-2"]} />
        <span className={STYLES["menu-toggle__line-3"]} />
      </button>
      <NavigationDialog ref={dialogRef} onClose={closeMenu} />
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Tunneller } from "@/types/tunnellers";
import { displayBiographyDates } from "@/utils/helpers/roll";
import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Menu.module.scss";

type Props = {
  tunnellers: Tunneller[];
};

export function Menu({ tunnellers }: Props) {
  const { width } = useWindowDimensions();
  const divRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

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

  const handleClickInside = () => {
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
    router.refresh();
  };

  const isMobileOrTablet = () => {
    return width && width < 896;
  };

  return (
    <div
      data-testid="menu"
      className={`${STYLES.menu} ${menuVisible ? "" : STYLES.hidden}`}
    >
      <Link href="/" className={STYLES.logo} aria-label="Go to the Homepage">
        <Image
          src="/nzt_logo.png"
          alt="New Zealand Tunnellers Wesbite - Home"
          width={30}
          height={30}
          priority
          placeholder="empty"
        />
      </Link>

      <div className={STYLES["search-form-container"]}>
        <div
          className={STYLES["search-form"]}
          onClick={handleClickInside}
          ref={searchFormRef}
        >
          <input
            disabled={!menuVisible}
            id="search"
            ref={inputRef}
            type="text"
            placeholder="Search for a Tunneller"
            value={query}
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
              aria-label="Clear search input"
            >
              <div className={STYLES["clear-search"]} aria-hidden="true">
                +
              </div>
            </button>
          ) : (
            <Image
              src="/search.png"
              alt="Type a name to search for a Tunneller"
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
                    href={`/tunnellers/${tunneller.id}`}
                    aria-label={`See ${tunneller.name.forename} ${tunneller.name.surname} profile`}
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
              href="/tunnellers"
              className={STYLES["tunnellers-link"]}
              onClick={handleNavigation}
            >
              <div className={STYLES["tunnellers-link-display"]}>
                <div>See all Tunnellers</div>
                <div className={STYLES.arrow}>&rarr;</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

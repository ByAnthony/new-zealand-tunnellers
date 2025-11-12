"use client";

import Image from "next/image";
import Link from "next/link";

import STYLES from "./Footer.module.scss";

export function Footer() {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className={STYLES.footer}>
      <div className={STYLES.map}>
        <div className={STYLES.links}>
          <div className={STYLES["map-link"]}>
            <Link href="/#history">History</Link>
          </div>
          <div className={STYLES["map-link"]}>
            <Link href="/tunnellers">Tunnellers</Link>
          </div>
          <div className={STYLES["map-link"]}>
            <Link href="/about-us">About Us</Link>
          </div>
        </div>
        <button
          type="button"
          className={STYLES["scroll-top"]}
          onClick={handleClick}
          aria-label="Go back to the top of the page"
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
            aria-label="Go to The Artois University website"
          >
            <Image
              src="/images/support/logo-univ-artois-blanc_0.png"
              alt="Artois University homepage"
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
            aria-label="Go to The Institute for Strategic Research website"
          >
            <Image
              src="/images/support/irsem-white.png"
              alt="Institute for Strategic Research homepage"
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

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { useWindowDimensions } from "@/utils/helpers/useWindowDimensions";

import STYLES from "./Tunnellers.module.scss";

export function Tunnellers() {
  const t = useTranslations("homepage");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const { width } = useWindowDimensions();
  const [isSvgRendered, setIsSvgRendered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsSvgRendered(true);
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  const svgElement = (height: number, width: number) => {
    return (
      <svg viewBox={`0 0 100 ${height}`} aria-hidden="true">
        <defs>
          <mask id="mask" x="0" y="0" width="100" height={height}>
            <rect x="0" y="0" width="100" height={height} fill="white" />
            <text x="0" y="10" textAnchor="start">
              {locale === "fr" ? (
                width <= 512 ? (
                  <>
                    <tspan x="0" dy="0.8em">
                      Les Kiwis
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      qui ont
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      lutté
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      sous
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      le no
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      man’s
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      land
                    </tspan>
                  </>
                ) : (
                  <>
                    <tspan x="0" dy="0.8em">
                      Les Kiwis qui
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      ont lutté
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      sous le
                    </tspan>
                    <tspan x="0" dy="0.8em">
                      no man’s land
                    </tspan>
                  </>
                )
              ) : width <= 512 ? (
                <>
                  <tspan x="0" dy="0.8em">
                    The Kiwis
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    who
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    fought
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    beneath
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    the no
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    man’s
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    land
                  </tspan>
                </>
              ) : (
                <>
                  <tspan x="0" dy="0.8em">
                    The Kiwis
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    who fought
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    beneath the
                  </tspan>
                  <tspan x="0" dy="0.8em">
                    no man’s land
                  </tspan>
                </>
              )}
            </text>
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height={height}
          fill="rgb(24, 26, 27)"
          mask="url(#mask)"
        />
      </svg>
    );
  };

  return (
    <>
      <div
        className={STYLES.intro}
        style={{
          backgroundImage: isSvgRendered
            ? `url("/images/homepage/ART_3670.jpg")`
            : "none",
        }}
      >
        <h1 className={STYLES["intro-text"]} aria-label={t("svgLabel")}>
          {width && svgElement(width <= 512 ? 125 : 60, width)}
        </h1>
      </div>
      <div className={STYLES["roll-wrapper"]}>
        <div className={STYLES["roll-container"]}>
          <Link href={`${localePrefix}/tunnellers/`} className={STYLES.roll}>
            <span className={STYLES.discover}>{t("discover")}</span>
            {t("nzTunnellers")}
          </Link>
        </div>
      </div>
    </>
  );
}

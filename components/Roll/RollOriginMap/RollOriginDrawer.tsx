"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";

import { renderSuperscript } from "@/utils/helpers/article";
import { displayBiographyDates } from "@/utils/helpers/roll";

import { OriginMarker } from "./originMapMarkers";
import STYLES from "./RollOriginMap.module.scss";

type Props = {
  origin: OriginMarker | null;
  isClosing?: boolean;
  onClose: () => void;
};

export function RollOriginDrawer({
  origin,
  isClosing = false,
  onClose,
}: Props) {
  const locale = useLocale();
  const tMaps = useTranslations("maps");
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const drawerRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!origin || isClosing) return;

    const previousActiveElement = document.activeElement;

    drawerRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isClosing, onClose, origin]);

  if (!origin) return null;

  return (
    <aside
      ref={drawerRef}
      className={`${STYLES["origin-drawer"]} ${isClosing ? STYLES["origin-drawer--closing"] : ""}`.trim()}
      role={isClosing ? undefined : "dialog"}
      aria-hidden={isClosing}
      aria-labelledby={isClosing ? undefined : titleId}
      aria-describedby={isClosing ? undefined : descriptionId}
      tabIndex={-1}
    >
      <div className={STYLES["origin-drawer-header"]}>
        <div className={STYLES["origin-drawer-title-row"]}>
          <h2 id={titleId} className={STYLES["origin-drawer-title"]}>
            {origin.town}
          </h2>
          <button
            className={STYLES["origin-drawer-close"]}
            onClick={onClose}
            aria-label={tMaps("closePanel")}
          >
            ×
          </button>
        </div>
        <div className={STYLES["origin-drawer-meta-row"]}>
          <p id={descriptionId} className={STYLES["origin-drawer-count"]}>
            {tMaps("originDrawerCount", { count: origin.count })}
          </p>
        </div>
      </div>
      <div className={STYLES["origin-drawer-list"]}>
        {origin.tunnellers.map((tunneller) => (
          <Link
            key={tunneller.id}
            href={`${localePrefix}/tunnellers/${tunneller.slug}`}
            className={STYLES["origin-drawer-link"]}
          >
            <div>
              <div className={STYLES["origin-drawer-rank-wrapper"]}>
                <div className={STYLES["origin-drawer-rank"]}>
                  {renderSuperscript(tunneller.rank)}
                </div>
                {tunneller.attachedCorps ? (
                  <div className={STYLES["origin-drawer-badge"]}>
                    {renderSuperscript(tunneller.attachedCorps)}
                  </div>
                ) : null}
              </div>
              <p className={STYLES["origin-drawer-forename"]}>
                {tunneller.name.forename}
              </p>
              <p className={STYLES["origin-drawer-surname"]}>
                {tunneller.name.surname}
              </p>
              <p className={STYLES["origin-drawer-detachment"]}>
                {renderSuperscript(tunneller.detachment)}
              </p>
              <p className={STYLES["origin-drawer-dates"]}>
                {displayBiographyDates(
                  tunneller.birthYear,
                  tunneller.deathYear,
                )}
              </p>
            </div>
            <div className={STYLES["origin-drawer-arrow"]}>&rarr;</div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

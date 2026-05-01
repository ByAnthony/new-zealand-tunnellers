"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";

import { OriginMarker } from "./originMapMarkers";
import { RollOriginDrawerCard } from "./RollOriginDrawerCard";
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
      aria-labelledby={isClosing ? undefined : titleId}
      aria-describedby={isClosing ? undefined : descriptionId}
      inert={isClosing ? true : undefined}
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
          <RollOriginDrawerCard
            key={tunneller.id}
            localePrefix={localePrefix}
            tunneller={tunneller}
          />
        ))}
      </div>
    </aside>
  );
}

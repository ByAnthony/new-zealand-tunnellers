"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import STYLES from "./RelatedChapterCard.module.scss";

function BookOpenBadge() {
  return (
    <span className={STYLES["related-chapter-badge"]} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          d="M12 7.5c-1.7-1.2-4.1-1.8-7-1.8v11.2c2.9 0 5.3.6 7 1.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.5c1.7-1.2 4.1-1.8 7-1.8v11.2c-2.9 0-5.3.6-7 1.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.5v11.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

type Props = {
  chapterId: string;
  localePrefix: string;
};

export function RelatedChapterCard({ chapterId, localePrefix }: Props) {
  const t = useTranslations("maps");
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className={STYLES["related-chapter-row"]}>
      <div className={STYLES["related-chapter-group"]}>
        <button
          type="button"
          className={STYLES["related-close-button"]}
          aria-label={t("closeRelatedChapterLink")}
          onClick={() => setIsDismissed(true)}
        >
          ×
        </button>
        <Link
          href={`${localePrefix}/history/${chapterId}`}
          aria-label={t("relatedChapterLabel")}
          className={STYLES["related-link"]}
        >
          <span className={STYLES["related-link-main"]}>
            <BookOpenBadge />
            <span className={STYLES["related-link-label"]}>
              {t("relatedChapterLabel")}
            </span>
          </span>
          <span className={STYLES["related-link-arrow"]} aria-hidden="true">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}

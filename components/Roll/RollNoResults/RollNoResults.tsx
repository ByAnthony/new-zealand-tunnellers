"use client";

import { useTranslations } from "next-intl";

import STYLES from "./RollNoResults.module.scss";

type Props = {
  handleResetFilters: () => void;
};

export function RollNoResults({ handleResetFilters }: Props) {
  const t = useTranslations("roll");

  return (
    <div className={STYLES["no-results"]}>
      <p>{t("noResults")}</p>
      <button onClick={handleResetFilters}>{t("clearFilters")}</button>
    </div>
  );
}

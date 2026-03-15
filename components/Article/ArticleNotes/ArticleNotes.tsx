"use client";

import { useTranslations } from "next-intl";

import { formatText } from "@/utils/helpers/article";

import STYLES from "./ArticleNotes.module.scss";

type Props = {
  notes: string;
};

export function ArticleNotes({ notes }: Props) {
  const t = useTranslations("article");

  return (
    <div className={STYLES.notes}>
      <h2>{t("notes")}</h2>
      {formatText(notes)}
    </div>
  );
}

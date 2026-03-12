"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import type {
  EmbarkationUnit,
  Enlistment,
  ImageTunneller,
  Summary,
} from "@/types/tunneller";

import STYLES from "./ProfileSummary.module.scss";

type Props = {
  summary: Summary;
  embarkationUnit: EmbarkationUnit;
  enlistment: Enlistment;
  image: ImageTunneller | null;
};

function RenderImage({
  imageUrl,
  tunneller,
}: {
  imageUrl: string | undefined;
  tunneller: Summary;
}) {
  return imageUrl ? (
    <div className={STYLES["image-card"]}>
      <Image
        src={`/images/roll/tunnellers/${imageUrl}`}
        alt={`Portrait of ${tunneller.name.forename} ${tunneller.name.surname}`}
        width={320}
        height={475}
        className={STYLES["tunneller-image"]}
        placeholder="empty"
      />
    </div>
  ) : null;
}

function RenderUnit({
  unit,
  section,
  label,
}: {
  unit: string;
  section: string | null;
  label: string;
}) {
  return (
    <div className={STYLES["fullwidth-main-card"]}>
      <p>{label}</p>
      <span>{section ? `${unit} (${section})` : `${unit}`}</span>
    </div>
  );
}

export function ProfileSummary({
  summary,
  embarkationUnit,
  enlistment,
  image,
}: Props) {
  const t = useTranslations("profile");

  return (
    <div className={STYLES.overview}>
      <RenderImage imageUrl={image?.url} tunneller={summary} />
      <RenderUnit
        unit={embarkationUnit.detachment}
        section={embarkationUnit.section}
        label={t("unit")}
      />
      <div className={STYLES["halfwidth-cards-container"]}>
        <div className={STYLES["halfwidth-secondary-card"]}>
          <p>{t("rank")}</p>
          <span>{enlistment.rank}</span>
        </div>
        <div className={STYLES["halfwidth-secondary-card"]}>
          <p>{t("serial")}</p>
          <span>{enlistment.serial}</span>
        </div>
      </div>
      {embarkationUnit.attachedCorps && (
        <div className={STYLES["fullwidth-main-card"]}>
          <p>{t("corps")}</p>
          <span>{embarkationUnit.attachedCorps}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { HowToCite } from "@/components/HowToCite/HowToCite";
import { TimelineEvents } from "@/components/Timeline/TimelineEvents/TimelineEvents";
import { Title } from "@/components/Title/Title";
import { TunnellerProfile } from "@/types/tunneller";

import STYLES from "./Timeline.module.scss";

type Props = {
  tunneller: TunnellerProfile;
};

export function Timeline({ tunneller }: Props) {
  const t = useTranslations("timeline");
  const locale = useLocale();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  return (
    <div className={STYLES.timeline}>
      <div className={STYLES.header}>
        <div className={STYLES.link}>
          <Link href={`${localePrefix}/tunnellers`}>{t("tunnellers")}</Link>
          <span>/</span>
          <Link
            href={`${localePrefix}/tunnellers/${tunneller.slug}`}
          >{`${tunneller.summary.name.forename} ${tunneller.summary.name.surname}`}</Link>
        </div>
        <div className={STYLES["main-title"]}>
          <Title title={t("title")} />
        </div>
      </div>
      <div className={STYLES.events}>
        <div className={STYLES.line}>
          <TimelineEvents militaryYears={tunneller.militaryYears} />
        </div>
      </div>
      <HowToCite
        tunnellerSlug={tunneller.slug}
        summary={tunneller.summary}
        timeline
      />
    </div>
  );
}

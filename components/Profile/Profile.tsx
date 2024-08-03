"use client";

import Link from "next/link";

import { HowToCite } from "@/components/HowToCite/HowToCite";
import { ProfileDiary } from "@/components/Profile/ProfileDiary/ProfileDiary";
import { ProfileImageSource } from "@/components/Profile/ProfileImageSource/ProfileImageSource";
import { ProfileSources } from "@/components/Profile/ProfileSources/ProfileSources";
import { ProfileSummary } from "@/components/Profile/ProfileSummary/ProfileSummary";
import { Title } from "@/components/Title/Title";
import { TunnellerProfile } from "@/types/tunneller";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./Profile.module.scss";

type Props = {
  tunneller: TunnellerProfile;
};

export function Profile({ tunneller }: Props) {
  return (
    <>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <div className={STYLES.link}>
            <Link href="/tunnellers">Tunnellers</Link>
          </div>
          <Title
            name={tunneller.summary.name}
            subTitle={displayBiographyDates(
              tunneller.summary.birth,
              tunneller.summary.death,
            )}
          />
        </div>
      </div>
      <div className={STYLES.profile}>
        <div className={STYLES["flex-summary"]}>
          <div className={STYLES.summary}>
            <ProfileSummary
              summary={tunneller.summary}
              embarkationUnit={tunneller.militaryYears.embarkationUnit}
              enlistment={tunneller.militaryYears.enlistment}
              image={tunneller.image}
            />
          </div>
        </div>
        <div className={STYLES["flex-diary"]}>
          <ProfileDiary
            tunnellerId={tunneller.id}
            origins={tunneller.origins}
            preWarYears={tunneller.preWarYears}
            militaryYears={tunneller.militaryYears}
            death={tunneller.death}
          />
          <ProfileSources sources={tunneller.sources} />
          <ProfileImageSource source={tunneller.image?.source} />
          <HowToCite id={tunneller.id} summary={tunneller.summary} />
        </div>
      </div>
    </>
  );
}

"use client";

import { DiaryBirth } from "@/components/Profile/ProfileDiary//DiaryBirthInfo/DiaryBirthInfo";
import { DiaryDied } from "@/components/Profile/ProfileDiary//DiaryDied/DiaryDied";
import { DiaryHometown } from "@/components/Profile/ProfileDiary//DiaryHometown/DiaryHometown";
import { DiaryLife } from "@/components/Profile/ProfileDiary//DiaryLife/DiaryLife";
import { DiaryMedal } from "@/components/Profile/ProfileDiary//DiaryMedal/DiaryMedal";
import { DiaryParents } from "@/components/Profile/ProfileDiary//DiaryParents/DiaryParents";
import { DiaryWork } from "@/components/Profile/ProfileDiary//DiaryWork/DiaryWork";
import { DiaryArmyExperience } from "@/components/Profile/ProfileDiary/DiaryArmyExperience/DiaryArmyExperience";
import { DiaryArrivedInNz } from "@/components/Profile/ProfileDiary/DiaryArrivedInNz/DiaryArrivedInNz";
import { MilitaryYears, Origins, Death, PreWayYears } from "@/types/tunneller";

import STYLES from "./ProfileDiary.module.scss";

type Props = {
  tunnellerId: number;
  origins: Origins;
  preWarYears: PreWayYears;
  militaryYears: MilitaryYears;
  death: Death | null;
};

export function ProfileDiary({
  tunnellerId,
  origins,
  preWarYears,
  militaryYears,
  death,
}: Props) {
  return (
    <div className={STYLES.diary}>
      <h2>About</h2>
      <DiaryBirth birth={origins.birth} />
      <DiaryParents parents={origins.parents} />
      <DiaryArrivedInNz inNzLength={origins.inNzLength} />
      <DiaryHometown residence={preWarYears.residence} />
      <DiaryWork employment={preWarYears.employment} />
      <DiaryLife
        maritalStatus={preWarYears.maritalStatus}
        wife={preWarYears.wife}
      />
      <DiaryArmyExperience
        tunnellerId={tunnellerId}
        armyExperience={preWarYears.armyExperience}
      />
      <DiaryMedal medals={militaryYears.medals} />
      <DiaryDied death={death} />
    </div>
  );
}

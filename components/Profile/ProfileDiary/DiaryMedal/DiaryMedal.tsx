"use client";

import Image from "next/image";

import { Medal } from "@/types/tunneller";

import OTHER_MEDALS_STYLES from "./DiaryMedal.module.scss";
import STYLES from "../ProfileDiary.module.scss";

type Props = {
  medals: Medal[] | [];
};

function BritishWarAndVictoryMedals({
  medalsList,
}: {
  medalsList: Medal[] | [];
}) {
  const filteredMedals = medalsList.filter(
    (medal) =>
      medal.image === "british-war-medal.png" ||
      medal.image === "victory-medal.png",
  );

  if (filteredMedals.length > 0) {
    return (
      <div className={STYLES["halfwidth-cards-container"]}>
        {filteredMedals.map((medal) => (
          <div
            key={filteredMedals.indexOf(medal)}
            className={STYLES["halfwidth-secondary-card"]}
          >
            <p>
              <Image
                src={`/images/roll/medals/${medal.image}`}
                alt={`${medal.name} ribbon`}
                width={40}
                height={11}
                placeholder="empty"
              />
            </p>
            <span>{medal.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function OtherMedals({ medalsList }: { medalsList: Medal[] | [] }) {
  const filteredMedals = medalsList.filter(
    (medal) =>
      medal.image !== "british-war-medal.png" &&
      medal.image !== "victory-medal.png",
  );
  return (
    <>
      {filteredMedals.map((medal) => {
        const displayCountry =
          medal.country_key !== "United Kingdom" ? `(${medal.country})` : "";
        return (
          <div
            key={filteredMedals.indexOf(medal)}
            className={OTHER_MEDALS_STYLES["other-medal"]}
          >
            <p>
              <Image
                src={`/images/roll/medals/${medal.image}`}
                alt={`${medal.name} ribbon`}
                width={40}
                height={11}
                placeholder="empty"
              />
            </p>
            <span>{`${medal.name} ${displayCountry}`}</span>
            <div className={OTHER_MEDALS_STYLES.citation}>
              <span>{`${medal.citation}.`}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function DiaryMedal({ medals }: Props) {
  return (
    <>
      <BritishWarAndVictoryMedals medalsList={medals} />
      <OtherMedals medalsList={medals} />
    </>
  );
}

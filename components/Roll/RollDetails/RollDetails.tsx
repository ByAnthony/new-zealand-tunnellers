"use client";

import Link from "next/link";
import { useCallback } from "react";

import { Tunneller } from "@/types/tunnellers";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./RollDetails.module.scss";

type Props = {
  listOfTunnellers: Tunneller[];
};

export function AttachedCorpsBadge({
  attachedCorps,
}: {
  attachedCorps: string;
}) {
  return <div className={STYLES.badge}>{attachedCorps}</div>;
}

export function RollDetails({ listOfTunnellers }: Props) {
  const saveScroll = useCallback(() => {
    try {
      localStorage.setItem("roll:scrollY", String(window.scrollY || 0));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save scroll position: ${errorMessage}`);
    }
  }, []);

  return (
    <>
      {listOfTunnellers.map((tunneller: Tunneller) => (
        <Link
          href={`/tunnellers/${tunneller.id}`}
          key={tunneller.id}
          onClick={saveScroll}
        >
          <div className={STYLES.tunneller}>
            <div>
              <div className={STYLES["rank-wrapper"]}>
                <div className={STYLES.rank}>{tunneller.rank}</div>
                {tunneller.attachedCorps ? (
                  <AttachedCorpsBadge attachedCorps={tunneller.attachedCorps} />
                ) : null}
              </div>
              <p className={STYLES.forename}>{tunneller.name.forename}</p>
              <p className={STYLES.surname}>{tunneller.name.surname}</p>
              <p className={STYLES.detachment}>{tunneller.detachment}</p>
              <p className={STYLES.dates}>
                {displayBiographyDates(
                  tunneller.birthYear,
                  tunneller.deathYear,
                )}
              </p>
            </div>
            <div className={STYLES.arrow}>&rarr;</div>
          </div>
        </Link>
      ))}
    </>
  );
}

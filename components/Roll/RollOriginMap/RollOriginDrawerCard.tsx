import Link from "next/link";

import { Tunneller } from "@/types/tunnellers";
import { renderSuperscript } from "@/utils/helpers/article";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./RollOriginMap.module.scss";

type Props = {
  localePrefix: string;
  tunneller: Tunneller;
};

export function RollOriginDrawerCard({ localePrefix, tunneller }: Props) {
  return (
    <Link
      href={`${localePrefix}/tunnellers/${tunneller.slug}`}
      className={STYLES["origin-drawer-link"]}
    >
      <div>
        <div className={STYLES["origin-drawer-rank-wrapper"]}>
          <div className={STYLES["origin-drawer-rank"]}>
            {renderSuperscript(tunneller.rank)}
          </div>
          {tunneller.attachedCorps ? (
            <div className={STYLES["origin-drawer-badge"]}>
              {renderSuperscript(tunneller.attachedCorps)}
            </div>
          ) : null}
        </div>
        <p className={STYLES["origin-drawer-forename"]}>
          {tunneller.name.forename}
        </p>
        <p className={STYLES["origin-drawer-surname"]}>
          {tunneller.name.surname}
        </p>
        <p className={STYLES["origin-drawer-detachment"]}>
          {renderSuperscript(tunneller.detachment)}
        </p>
        <p className={STYLES["origin-drawer-dates"]}>
          {displayBiographyDates(tunneller.birthYear, tunneller.deathYear)}
        </p>
      </div>
      <div className={STYLES["origin-drawer-arrow"]}>&rarr;</div>
    </Link>
  );
}

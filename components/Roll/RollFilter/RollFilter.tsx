"use client";

import { useTranslations } from "next-intl";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { FilterOption } from "@/types/tunnellers";
import { renderSuperscript } from "@/utils/helpers/article";

import STYLES from "./RollFilter.module.scss";
import { rankCategoryTranslationKey } from "../utils/rankUtils";

type Props = {
  className: string;
  uniqueDetachments: FilterOption[];
  uniquecorps: FilterOption[];
  uniqueBirthYears: string[];
  uniqueDeathYears: string[];
  sortedRanks: {
    [key: string]: FilterOption[];
  };
  filters: {
    detachment: (number | null)[];
    corps: (number | null)[];
    birthYear: string[];
    deathYear: string[];
    ranks: {
      [key: string]: (number | null)[];
    };
    unknownBirthYear: string;
    unknownDeathYear: string;
  };
  startBirthYear: string;
  endBirthYear: string;
  startDeathYear: string;
  endDeathYear: string;
  // eslint-disable-next-line no-unused-vars
  handleDetachmentFilter: (detachmentId: number | null) => void;
  // eslint-disable-next-line no-unused-vars
  handleCorpsFilter: (corpsId: number | null) => void;
  // eslint-disable-next-line no-unused-vars
  handleBirthSliderChange: (value: number | number[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleDeathSliderChange: (value: number | number[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleRankFilter: (rank: { [key: string]: (number | null)[] }) => void;
  // eslint-disable-next-line no-unused-vars
  handleUnknwonBirthYear: (unknownBirthYear: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleUnknwonDeathYear: (unknownDeathYear: string) => void;
};

export function RollFilter({
  className,
  uniqueDetachments,
  uniquecorps,
  uniqueBirthYears,
  uniqueDeathYears,
  sortedRanks,
  filters,
  startBirthYear,
  endBirthYear,
  startDeathYear,
  endDeathYear,
  handleDetachmentFilter,
  handleCorpsFilter,
  handleBirthSliderChange,
  handleDeathSliderChange,
  handleRankFilter,
  handleUnknwonBirthYear,
  handleUnknwonDeathYear,
}: Props) {
  const t = useTranslations("roll");

  return (
    <div className={className}>
      <div className={STYLES.filters}>
        <h3>{t("detachments")}</h3>
        {uniqueDetachments.map((detachment) => (
          <div key={String(detachment.id)}>
            <label>
              <input
                type="checkbox"
                id={String(detachment.id)}
                name={detachment.label}
                value={String(detachment.id)}
                onChange={() => handleDetachmentFilter(detachment.id)}
                checked={
                  filters.detachment &&
                  filters.detachment.includes(detachment.id)
                    ? true
                    : false
                }
              />
              {renderSuperscript(detachment.label)}
            </label>
          </div>
        ))}
      </div>
      <div className={STYLES.filters}>
        <h3>{t("corps")}</h3>
        {uniquecorps.map((corps) => (
          <div key={String(corps.id)}>
            <label>
              <input
                type="checkbox"
                id={String(corps.id)}
                name={corps.label}
                value={String(corps.id)}
                onChange={() => handleCorpsFilter(corps.id)}
                checked={
                  filters.corps && filters.corps.includes(corps.id)
                    ? true
                    : false
                }
              />
              {corps.id === null ? t("tunnellingCorps") : corps.label}
            </label>
          </div>
        ))}
      </div>
      <div className={STYLES.filters}>
        <h3>{t("birthYears")}</h3>
        <p>
          {startBirthYear}
          {endBirthYear && endBirthYear !== startBirthYear
            ? `-${endBirthYear}`
            : ""}
        </p>
        <div className={STYLES.slider}>
          <Slider
            range
            min={Number(uniqueBirthYears[0])}
            max={Number(uniqueBirthYears[uniqueBirthYears.length - 1])}
            value={[Number(startBirthYear), Number(endBirthYear)]}
            onChange={handleBirthSliderChange}
            allowCross={false}
            styles={{
              track: { background: "rgb(153, 131, 100)" },
              rail: { background: "rgb(64, 66, 67)" },
              handle: {
                border: "2px solid rgb(153, 131, 100)",
                background: "rgb(29, 31, 32)",
                outline: "none",
                boxShadow: "0 0 5px rgba(64, 66, 67, 0.5)",
              },
            }}
          />
        </div>
        <div style={{ marginTop: "15px" }}>
          <label>
            <input
              type="checkbox"
              id={"unknownBirthYear"}
              name={"unknownBirthYear"}
              value={"unknownBirthYear"}
              onChange={() =>
                handleUnknwonBirthYear(
                  filters.unknownBirthYear === "unknown" ? "" : "unknown",
                )
              }
              checked={filters.unknownBirthYear === "unknown" ? true : false}
            />
            {t("includesUnknownBirthYear")}
          </label>
        </div>
      </div>
      <div className={STYLES.filters}>
        <h3>{t("deathYears")}</h3>
        <p>
          {startDeathYear}
          {endDeathYear && endDeathYear !== startDeathYear
            ? `-${endDeathYear}`
            : ""}
        </p>
        <div className={STYLES.slider}>
          <Slider
            range
            min={Number(uniqueDeathYears[0])}
            max={Number(uniqueDeathYears[uniqueDeathYears.length - 1])}
            value={[Number(startDeathYear), Number(endDeathYear)]}
            onChange={handleDeathSliderChange}
            allowCross={false}
            styles={{
              track: { background: "rgb(153, 131, 100)" },
              rail: { background: "rgb(64, 66, 67)" },
              handle: {
                border: "2px solid rgb(153, 131, 100)",
                background: "rgb(29, 31, 32)",
                outline: "none",
                boxShadow: "0 0 5px rgba(64, 66, 67, 0.5)",
              },
            }}
          />
        </div>
        <div style={{ marginTop: "15px" }}>
          <label>
            <input
              type="checkbox"
              id={"unknownDeathYear"}
              name={"unknownDeathYear"}
              value={"unknownDeathYear"}
              onChange={() =>
                handleUnknwonDeathYear(
                  filters.unknownDeathYear === "unknown" ? "" : "unknown",
                )
              }
              checked={filters.unknownDeathYear === "unknown" ? true : false}
            />
            {t("includesUnknownDeathYear")}
          </label>
        </div>
        <div className={STYLES.filters}>
          <h3>{t("ranks")}</h3>
          {Object.entries(sortedRanks).map(([category, ranks]) => (
            <div key={category} style={{ marginBottom: "15px" }}>
              <label className={STYLES["rank-category"]}>
                <input
                  type="checkbox"
                  id={category}
                  name={category}
                  value={category}
                  onChange={() =>
                    handleRankFilter({
                      [category]: ranks.map((r) => r.id),
                    })
                  }
                  checked={
                    ranks.every((rank) =>
                      filters.ranks?.[category]?.includes(rank.id),
                    )
                      ? true
                      : false
                  }
                />
                {t(rankCategoryTranslationKey[category] ?? category)}
              </label>
              {ranks.map((rank) => (
                <div key={String(rank.id)} style={{ marginLeft: "15px" }}>
                  <label>
                    <input
                      type="checkbox"
                      id={String(rank.id)}
                      name={rank.label}
                      value={String(rank.id)}
                      onChange={() =>
                        handleRankFilter({
                          [category]: [rank.id],
                        })
                      }
                      checked={
                        filters.ranks?.[category]?.includes(rank.id)
                          ? true
                          : false
                      }
                    />
                    {rank.label}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

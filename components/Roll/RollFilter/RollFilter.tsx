"use client";

import { useTranslations } from "next-intl";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import STYLES from "./RollFilter.module.scss";

type Props = {
  className: string;
  uniqueDetachments: string[];
  uniquecorps: string[];
  uniqueBirthYears: string[];
  uniqueDeathYears: string[];
  sortedRanks: {
    [key: string]: string[];
  };
  filters: {
    detachment: string[];
    corps: string[];
    birthYear: string[];
    deathYear: string[];
    ranks: {
      [key: string]: string[];
    };
    unknownBirthYear: string;
    unknownDeathYear: string;
  };
  startBirthYear: string;
  endBirthYear: string;
  startDeathYear: string;
  endDeathYear: string;
  // eslint-disable-next-line no-unused-vars
  handleDetachmentFilter: (detachment: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleCorpsFilter: (corps: string) => void;
  // eslint-disable-next-line no-unused-vars
  handleBirthSliderChange: (value: number | number[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleDeathSliderChange: (value: number | number[]) => void;
  // eslint-disable-next-line no-unused-vars
  handleRankFilter: (rank: { [key: string]: string[] }) => void;
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
          <div key={detachment}>
            <label>
              <input
                type="checkbox"
                id={detachment}
                name={detachment}
                value={detachment}
                onChange={() => handleDetachmentFilter(detachment)}
                checked={
                  filters.detachment && filters.detachment.includes(detachment)
                    ? true
                    : false
                }
              />
              {detachment}
            </label>
          </div>
        ))}
      </div>
      <div className={STYLES.filters}>
        <h3>{t("corps")}</h3>
        {uniquecorps.map((corps) => (
          <div key={corps}>
            <label>
              <input
                type="checkbox"
                id={corps}
                name={corps}
                value={corps}
                onChange={() => handleCorpsFilter(corps)}
                checked={
                  filters.corps && filters.corps.includes(corps) ? true : false
                }
              />
              {corps}
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
                      [category]: [],
                    })
                  }
                  checked={
                    ranks.every((rank) =>
                      filters.ranks?.[category]?.includes(rank),
                    )
                      ? true
                      : false
                  }
                />
                {category}
              </label>
              {ranks.map((rank) => (
                <div key={rank} style={{ marginLeft: "15px" }}>
                  <label>
                    <input
                      type="checkbox"
                      id={rank}
                      name={rank}
                      value={rank}
                      onChange={() =>
                        handleRankFilter({
                          [category]: [rank],
                        })
                      }
                      checked={
                        filters.ranks?.[category]?.includes(rank) ? true : false
                      }
                    />
                    {rank}
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

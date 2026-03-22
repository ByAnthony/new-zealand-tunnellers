import Slider from "rc-slider";
import { useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import type { CSSProperties } from "react";

import STYLES from "./WorksSlider.module.scss";

const COLOR_SECONDARY = "rgb(153, 131, 100)";
const COLOR_RAIL = "rgb(64, 66, 67)";
const COLOR_HANDLE_BG = "rgb(29, 31, 32)";

type Props = {
  dateRange: [number, number];
  onChange: (_value: [number, number]) => void;
  minMonth: number;
  maxMonth: number;
};

function formatMonth(monthNum: number): string {
  const year = Math.floor(monthNum / 12);
  const month = monthNum % 12;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[month]} ${year}`;
}

export function WorksSlider({
  dateRange,
  onChange,
  minMonth,
  maxMonth,
}: Props) {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 32rem)").matches,
  );
  const [isTablet, setIsTablet] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 32rem) and (max-width: 56rem)").matches,
  );

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 32rem)");
    const mqTablet = window.matchMedia(
      "(min-width: 32rem) and (max-width: 56rem)",
    );
    const handleMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleTablet = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mqMobile.addEventListener("change", handleMobile);
    mqTablet.addEventListener("change", handleTablet);
    return () => {
      mqMobile.removeEventListener("change", handleMobile);
      mqTablet.removeEventListener("change", handleTablet);
    };
  }, []);

  const markStyle: CSSProperties = {
    color: COLOR_SECONDARY,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  };

  const totalMarks = isMobile ? 4 : isTablet ? 5 : 6;

  const marks: Record<number, { style: CSSProperties; label: string }> = {};
  const range = maxMonth - minMonth;
  Array.from({ length: totalMarks }, (_, i) =>
    Math.round(minMonth + (i * range) / (totalMarks - 1)),
  ).forEach((m) => {
    marks[m] = { style: markStyle, label: formatMonth(m) };
  });

  return (
    <div className={STYLES.slider}>
      <Slider
        range
        min={minMonth}
        max={maxMonth}
        value={dateRange}
        onChange={(value) => {
          if (Array.isArray(value)) onChange([value[0], value[1]]);
        }}
        marks={marks}
        dots
        allowCross={false}
        styles={{
          track: { background: COLOR_SECONDARY },
          rail: { background: COLOR_RAIL },
          handle: {
            border: `2px solid ${COLOR_SECONDARY}`,
            background: COLOR_HANDLE_BG,
            outline: "none",
            boxShadow: `0 0 5px ${COLOR_RAIL}80`,
          },
        }}
      />
    </div>
  );
}

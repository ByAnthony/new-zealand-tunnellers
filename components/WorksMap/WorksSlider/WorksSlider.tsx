import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import type { CSSProperties } from "react";

import STYLES from "./WorksSlider.module.scss";

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
  const marks: Record<number, { style: CSSProperties; label: string }> = {};
  for (let m = minMonth; m <= maxMonth; m++) {
    if ((m - minMonth) % 3 === 0) {
      marks[m] = {
        style: {
          color: "rgb(153, 131, 100)",
          fontSize: "0.85rem",
          whiteSpace: "nowrap",
        },
        label: formatMonth(m),
      };
    }
  }

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
  );
}

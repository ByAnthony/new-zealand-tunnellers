import { useLocale } from "next-intl";
import Slider from "rc-slider";
import { useState } from "react";
import "rc-slider/assets/index.css";

import STYLES from "./WorksSlider.module.scss";
import { formatDay } from "../utils/mapParams";

const COLOR_SECONDARY = "rgb(153, 131, 100)";
const COLOR_RAIL = "rgb(64, 66, 67)";
const COLOR_HANDLE_BG = "rgb(29, 31, 32)";

type Props = {
  dateRange: [number, number];
  onChange: (_value: [number, number]) => void;
  onChangeComplete?: () => void;
  minMonth: number;
  maxMonth: number;
  clampMin?: number;
  clampMax?: number;
};

export function WorksSlider({
  dateRange,
  onChange,
  onChangeComplete,
  minMonth,
  maxMonth,
  clampMin,
  clampMax,
}: Props) {
  const locale = useLocale();
  const [dragging, setDragging] = useState<[number, number] | null>(null);

  return (
    <div className={STYLES.slider}>
      <div className={STYLES.tooltip}>
        <span>{formatDay((dragging ?? dateRange)[0], locale)}</span>
        <span>{formatDay((dragging ?? dateRange)[1], locale)}</span>
      </div>
      <div className={STYLES["slider-track"]}>
        <Slider
          range
          min={minMonth}
          max={maxMonth}
          value={dateRange}
          onChange={(value) => {
            if (Array.isArray(value)) {
              const lo =
                clampMin !== undefined
                  ? Math.max(clampMin, value[0])
                  : value[0];
              const hi =
                clampMax !== undefined
                  ? Math.min(clampMax, value[1])
                  : value[1];
              onChange([lo, hi]);
              setDragging([lo, hi]);
            }
          }}
          onChangeComplete={() => {
            setDragging(null);
            onChangeComplete?.();
          }}
          dots={false}
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
    </div>
  );
}

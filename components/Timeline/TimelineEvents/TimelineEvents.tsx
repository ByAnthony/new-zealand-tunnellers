"use client";

import { useTranslations } from "next-intl";

import { TimelineEvent } from "@/components/Timeline/TimelineEvent/TimelineEvent";
import { Event, MilitaryYears } from "@/types/tunneller";

import STYLES from "../Timeline.module.scss";

type Props = {
  militaryYears: MilitaryYears;
};

export function TimelineEvents({ militaryYears }: Props) {
  const t = useTranslations("timeline");
  const { frontEvents } = militaryYears;
  const { ageAtEnlistment } = militaryYears.enlistment;
  const frontEventsByYear = Object.entries(frontEvents);

  return (
    <>
      {frontEventsByYear.map(([key, events]) => (
        <div key={key}>
          <h2
            className={STYLES["year-title"]}
            key={key}
            aria-label={t("year", { year: key })}
          >
            {key}
          </h2>
          {events.map((event: Event) => (
            <div key={events.indexOf(event)}>
              <div className={STYLES.date}>
                <div className={STYLES.year}>{`${event.date.year}`}</div>
                <div
                  className={STYLES["day-month"]}
                >{`${event.date.dayMonth}`}</div>
              </div>
              <div className={STYLES["event-wrapper"]}>
                <TimelineEvent
                  event={event.event}
                  ageAtEnlistment={ageAtEnlistment}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { EventDetail } from "@/types/tunneller";

import STYLES from "../Timeline.module.scss";

type Props = {
  event: EventDetail[];
  ageAtEnlistment: number | null;
};

export function TimelineEvent({ event, ageAtEnlistment }: Props) {
  const t = useTranslations("timeline");

  return (
    <>
      {event.map((eventDetail: EventDetail) => {
        const { title } = eventDetail;

        const isTitleCompany = title === "The Company";
        const isTitleEnlisted = title === "Enlisted";
        const isTitlePosted = title === "Posted";
        const isTitleTrained = title === "Trained";
        const isTitleKilledInAction = title === "Killed in action";
        const isTitleDiedOfWounds = title === "Died of wounds";
        const isTitleDiedOfDisease = title === "Died of disease";
        const isTitleDiedOfAccident = title === "Died of accident";
        const isTitleBuried = title === "Buried";
        const isTitleGraveReference = title === "Grave reference";

        const titleWithAgeAtEnlistment = (age: number | null) => {
          if (age) {
            return t("enlistedAtAge", { title, age });
          }
          return title;
        };

        if (title) {
          if (isTitleCompany) {
            return (
              <div key={event.indexOf(eventDetail)}>
                <div className={STYLES["company-event"]}>
                  <Image
                    src={`/images/roll/${eventDetail.image}`}
                    alt={
                      eventDetail.imageAlt ??
                      t("companyEventAlt", {
                        title:
                          eventDetail.title || t("companyEventAltFallback"),
                      })
                    }
                    width={670}
                    height={489}
                    className={STYLES["event-image"]}
                    placeholder="empty"
                  />
                  <p>{eventDetail.description}</p>
                </div>
              </div>
            );
          }

          if (isTitleEnlisted || isTitlePosted) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <p>{titleWithAgeAtEnlistment(ageAtEnlistment)}</p>
                <span>{eventDetail.description}</span>
              </div>
            );
          }

          if (isTitleTrained) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["tunneller-event-with-title"]}
              >
                <p>{title}</p>
                <span>{eventDetail.description}</span>
              </div>
            );
          }

          if (
            isTitleKilledInAction ||
            isTitleDiedOfWounds ||
            isTitleDiedOfDisease ||
            isTitleDiedOfAccident
          ) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <span>{title}</span>
                {eventDetail.extraDescription ? (
                  <span
                    className={STYLES.info}
                  >{` (${eventDetail.extraDescription})`}</span>
                ) : null}
                <span className={STYLES["info-block-with-description"]}>
                  {eventDetail.description}
                </span>
              </div>
            );
          }

          if (isTitleBuried || isTitleGraveReference) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["tunneller-event-with-title"]}
              >
                <p>{title}</p>
                <span>{eventDetail.description}</span>
              </div>
            );
          }

          return (
            <div
              key={event.indexOf(eventDetail)}
              className={STYLES["main-event"]}
            >
              <p>{title}</p>
              <span>{eventDetail.description}</span>
            </div>
          );
        }

        return (
          <div
            key={event.indexOf(eventDetail)}
            className={STYLES["tunneller-event"]}
          >
            <p>{eventDetail.description}</p>
          </div>
        );
      })}
    </>
  );
}

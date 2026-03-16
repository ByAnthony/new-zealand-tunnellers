"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { EventDetail } from "@/types/tunneller";
import { renderSuperscript } from "@/utils/helpers/article";

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
        const key = eventDetail.titleKey ?? title;

        const isTitleCompany = key === "The Company";
        const isTitleEnlisted = key === "Enlisted";
        const isTitlePosted = key === "Posted";
        const isTitleTrained = key === "Trained";
        const isTitleKilledInAction = key === "Killed in action";
        const isTitleDiedOfWounds = key === "Died of wounds";
        const isTitleDiedOfDisease = key === "Died of disease";
        const isTitleDiedOfAccident = key === "Died of accident";
        const isTitleBuried = key === "Buried";
        const isTitleGraveReference = key === "Grave reference";

        const titleWithAgeAtEnlistment = (
          title: string,
          age: number | null,
        ) => {
          const translatedTitle = isTitleEnlisted ? t("enlisted") : t("posted");
          if (age) {
            return t("enlistedAtAge", { title: translatedTitle, age });
          }
          return translatedTitle;
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
                  <p>{renderSuperscript(eventDetail.description)}</p>
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
                <p>{titleWithAgeAtEnlistment(title, ageAtEnlistment)}</p>
                <span>{renderSuperscript(eventDetail.description)}</span>
              </div>
            );
          }

          if (isTitleTrained) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["tunneller-event-with-title"]}
              >
                <p>{t("trained")}</p>
                <span>{renderSuperscript(eventDetail.description)}</span>
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
                  {renderSuperscript(eventDetail.description)}
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
                <p>{isTitleBuried ? t("buried") : t("graveReference")}</p>
                <span>{renderSuperscript(eventDetail.description)}</span>
              </div>
            );
          }

          return (
            <div
              key={event.indexOf(eventDetail)}
              className={STYLES["main-event"]}
            >
              <p>{title}</p>
              <span>{renderSuperscript(eventDetail.description)}</span>
            </div>
          );
        }

        return (
          <div
            key={event.indexOf(eventDetail)}
            className={STYLES["tunneller-event"]}
          >
            <p>{renderSuperscript(eventDetail.description)}</p>
          </div>
        );
      })}
    </>
  );
}

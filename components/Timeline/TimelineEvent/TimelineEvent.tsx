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

const TITLE_TRANSLATION_KEYS: Record<string, string> = {
  Enlisted: "enlisted",
  Posted: "posted",
  Trained: "trained",
  "Killed in action": "killedInAction",
  "Died of wounds": "diedOfWounds",
  "Died of disease": "diedOfDisease",
  "Died of accident": "diedOfAccident",
  Buried: "buried",
  "Grave reference": "graveReference",
  Demobilization: "demobilization",
  "End of Service": "endOfService",
  "Transfer to England": "transferToEngland",
  "Transfer to New Zealand": "transferToNewZealand",
  Transferred: "transferred",
};

const INLINE_INFO_TITLES = new Set([
  "Killed in action",
  "Died of wounds",
  "Died of disease",
  "Died of accident",
]);

const STACKED_TITLE_TITLES = new Set(["Trained", "Buried", "Grave reference"]);

export function TimelineEvent({ event, ageAtEnlistment }: Props) {
  const t = useTranslations("timeline");

  const getTranslatedTitle = (key: string, fallbackTitle: string | null) => {
    const translationKey = TITLE_TRANSLATION_KEYS[key];
    return translationKey ? t(translationKey) : fallbackTitle;
  };

  const getTitleWithAgeAtEnlistment = (key: string, age: number | null) => {
    const translatedTitle = key === "Enlisted" ? t("enlisted") : t("posted");
    if (age) {
      return t("enlistedAtAge", { title: translatedTitle, age });
    }
    return translatedTitle;
  };

  return (
    <>
      {event.map((eventDetail: EventDetail) => {
        const { title, titleKey, description, descriptionKey } = eventDetail;
        const key = titleKey ?? title;
        const displayTitle = key ? getTranslatedTitle(key, title) : null;
        const displayDescription = descriptionKey
          ? t(descriptionKey)
          : description;

        if (key) {
          if (key === "The Company") {
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
                  <p>{renderSuperscript(displayDescription)}</p>
                </div>
              </div>
            );
          }

          if (key === "Enlisted" || key === "Posted") {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <p>{getTitleWithAgeAtEnlistment(key, ageAtEnlistment)}</p>
                <span>{renderSuperscript(displayDescription)}</span>
              </div>
            );
          }

          if (STACKED_TITLE_TITLES.has(key)) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["tunneller-event-with-title"]}
              >
                <p>{displayTitle}</p>
                <span>{renderSuperscript(displayDescription)}</span>
              </div>
            );
          }

          if (INLINE_INFO_TITLES.has(key)) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <span>{displayTitle}</span>
                {eventDetail.extraDescription ? (
                  <span
                    className={STYLES.info}
                  >{` (${eventDetail.extraDescription})`}</span>
                ) : null}
                <span className={STYLES["info-block-with-description"]}>
                  {renderSuperscript(displayDescription)}
                </span>
              </div>
            );
          }

          return (
            <div
              key={event.indexOf(eventDetail)}
              className={STYLES["main-event"]}
            >
              <p>{displayTitle}</p>
              <span>{renderSuperscript(displayDescription)}</span>
            </div>
          );
        }

        return (
          <div
            key={event.indexOf(eventDetail)}
            className={STYLES["tunneller-event"]}
          >
            <p>{renderSuperscript(displayDescription)}</p>
          </div>
        );
      })}
    </>
  );
}

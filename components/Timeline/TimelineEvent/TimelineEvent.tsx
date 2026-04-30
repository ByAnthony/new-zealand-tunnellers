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

const TITLE_CONFIG: Record<
  string,
  {
    translationKey: string;
    variant: "default" | "enlistment" | "inlineInfo" | "stacked";
  }
> = {
  Enlisted: { translationKey: "enlisted", variant: "enlistment" },
  Posted: { translationKey: "posted", variant: "enlistment" },
  Trained: { translationKey: "trained", variant: "stacked" },
  "Killed in action": {
    translationKey: "killedInAction",
    variant: "inlineInfo",
  },
  "Died of wounds": {
    translationKey: "diedOfWounds",
    variant: "inlineInfo",
  },
  "Died of disease": {
    translationKey: "diedOfDisease",
    variant: "inlineInfo",
  },
  "Died of accident": {
    translationKey: "diedOfAccident",
    variant: "inlineInfo",
  },
  Buried: { translationKey: "buried", variant: "stacked" },
  "Grave reference": { translationKey: "graveReference", variant: "stacked" },
  Demobilization: { translationKey: "demobilization", variant: "default" },
  "End of Service": { translationKey: "endOfService", variant: "default" },
  "Transfer to England": {
    translationKey: "transferToEngland",
    variant: "default",
  },
  "Transfer to New Zealand": {
    translationKey: "transferToNewZealand",
    variant: "default",
  },
  Transferred: { translationKey: "transferred", variant: "default" },
};

export function TimelineEvent({ event, ageAtEnlistment }: Props) {
  const t = useTranslations("timeline");

  const getTranslatedTitle = (key: string, fallbackTitle: string | null) => {
    const config = TITLE_CONFIG[key];
    return config ? t(config.translationKey) : fallbackTitle;
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
        const titleConfig = key ? TITLE_CONFIG[key] : undefined;
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

          if (titleConfig?.variant === "stacked") {
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

          if (titleConfig?.variant === "inlineInfo") {
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

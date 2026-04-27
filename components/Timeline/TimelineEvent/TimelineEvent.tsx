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

  const getTranslatedTitle = (key: string, fallbackTitle: string | null) => {
    switch (key) {
      case "Enlisted":
        return t("enlisted");
      case "Posted":
        return t("posted");
      case "Trained":
        return t("trained");
      case "Buried":
        return t("buried");
      case "Grave reference":
        return t("graveReference");
      case "Demobilization":
        return t("demobilization");
      case "End of Service":
        return t("endOfService");
      case "Transfer to England":
        return t("transferToEngland");
      case "Transfer to New Zealand":
        return t("transferToNewZealand");
      case "Transferred":
        return t("transferred");
      default:
        return fallbackTitle;
    }
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
        const isTitleDemobilization = key === "Demobilization";
        const isTitleEndOfService = key === "End of Service";

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

        if (key) {
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
                  <p>{renderSuperscript(displayDescription)}</p>
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
                <p>{titleWithAgeAtEnlistment(key, ageAtEnlistment)}</p>
                <span>{renderSuperscript(displayDescription)}</span>
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
                <span>{renderSuperscript(displayDescription)}</span>
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

          if (isTitleBuried || isTitleGraveReference) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["tunneller-event-with-title"]}
              >
                <p>{isTitleBuried ? t("buried") : t("graveReference")}</p>
                <span>{renderSuperscript(displayDescription)}</span>
              </div>
            );
          }

          if (isTitleDemobilization) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <p>{t("demobilization")}</p>
                <span>{renderSuperscript(displayDescription)}</span>
              </div>
            );
          }

          if (isTitleEndOfService) {
            return (
              <div
                key={event.indexOf(eventDetail)}
                className={STYLES["main-event"]}
              >
                <p>{t("endOfService")}</p>
                <span>{renderSuperscript(displayDescription)}</span>
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

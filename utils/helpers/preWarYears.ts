import { ArmyExperience } from "@/types/tunneller";

export const getArmyExperience = (
  experiences: ArmyExperience[],
  locale: string = "en",
) => {
  const convertMonthToYear = (duration: string | null) => {
    if (duration) {
      const durationAsNumber = Number(duration);
      if (locale === "fr") {
        if (durationAsNumber < 12) {
          return `${duration} mois`;
        }
        const year = durationAsNumber / 12;
        return year === 1 ? `${year} an` : `${year} ans`;
      }
      if (durationAsNumber < 12) {
        return durationAsNumber === 1
          ? `${duration} month`
          : `${duration} months`;
      }
      const year = durationAsNumber / 12;
      return year === 1 ? `${year} year` : `${year} years`;
    }
    return null;
  };

  return experiences.map((experience: ArmyExperience) => ({
    unit: experience.unit,
    country: experience.country,
    country_key: experience.country_key,
    conflict: experience.conflict,
    duration: convertMonthToYear(experience.duration),
  }));
};

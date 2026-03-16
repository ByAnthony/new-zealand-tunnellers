import { DateObj, DeathPlace, DeathCause, Cemetery } from "@/types/tunneller";

export const getDeathPlace = (
  location: string | null,
  town: string | null,
  country: string | null,
) => {
  if (location && town && country) {
    return { location, town, country };
  }

  if (location && !town) {
    return { location, town: null, country: null };
  }
  return null;
};

export const getDeathPlaceWithoutCountry = (
  location: string | null,
  town: string | null,
) => {
  if (location && town) {
    return `${location}, ${town}`;
  }
  if (location && !town) {
    return location;
  }
  if (!location && town) {
    return town;
  }
  return null;
};

export const getDeathCause = (
  cause: string | null,
  circumstances: string | null,
) => {
  return cause ? { cause, circumstances } : null;
};

export const getCemetery = (
  name: string | null,
  location: string | null,
  country: string | null,
  grave: string | null,
) => {
  return name ? { name, location, country, grave } : null;
};

export const isWarInjuriesDeathAfterWar = (type: string | null) => {
  return type === "War injuries" ? true : false;
};

export const getDeath = (
  warInjuriesDeathAfterWar: boolean,
  deathTypeKey: string | null,
  date: DateObj | null,
  place: DeathPlace | null,
  cause: DeathCause | null,
  cemetery: Cemetery | null,
  ageAtDeath: number | null,
) => {
  const validDeathTypes = ["War", "War injuries", "After war"];
  if (
    (deathTypeKey && validDeathTypes.includes(deathTypeKey)) ||
    (!deathTypeKey && date)
  ) {
    return {
      warInjuriesDeathAfterWar,
      date,
      place,
      cause,
      cemetery,
      ageAtDeath,
    };
  }
  return null;
};

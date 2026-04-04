const BASE_URL = "https://www.nztunnellers.com";

export const pageUrl = (locale: string, path: string) =>
  locale === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/fr${path}`;

export const ogLocale = (locale: string) =>
  locale === "fr" ? "fr_FR" : "en_NZ";

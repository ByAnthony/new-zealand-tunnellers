export const BASE_URL = "https://www.nztunnellers.com";

const removeTrailingSlash = (path: string) =>
  path === "/" ? "" : path.replace(/\/$/, "");

export const pageUrl = (locale: string, path: string) => {
  const normalizedPath = removeTrailingSlash(path);

  if (locale === "en") {
    return normalizedPath ? `${BASE_URL}${normalizedPath}` : `${BASE_URL}/`;
  }

  return normalizedPath ? `${BASE_URL}/fr${normalizedPath}` : `${BASE_URL}/fr`;
};

export const ogLocale = (locale: string) =>
  locale === "fr" ? "fr_FR" : "en_NZ";

type MetadataInput = {
  locale: string;
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  firstName?: string;
  lastName?: string;
};

export function buildPageMetadata({
  locale,
  title,
  description,
  path,
  type = "website",
  firstName,
  lastName,
}: MetadataInput) {
  return {
    title,
    description,
    alternates: {
      canonical: pageUrl(locale, path),
      languages: {
        en: pageUrl("en", path),
        fr: pageUrl("fr", path),
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl(locale, path),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    },
  };
}

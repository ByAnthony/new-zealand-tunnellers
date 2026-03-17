// File system path — locale-specific directory where markdown files live
export const bookFilePath = (locale: string) =>
  locale === "fr"
    ? "books/les-kiwis-aussi-creusent-des-tunnels"
    : "books/kiwis-dig-tunnels-too";

// URL path — always English slug, prefixed with /fr/ when French
export const basePath = (locale: string) => {
  const localePrefix = locale === "en" ? "" : `/${locale}`;
  return `${localePrefix}/books/kiwis-dig-tunnels-too`;
};

export const bookTitle = (locale: string) =>
  locale === "fr"
    ? "Les Kiwis aussi creusent des tunnels"
    : "Kiwis Dig Tunnels Too";

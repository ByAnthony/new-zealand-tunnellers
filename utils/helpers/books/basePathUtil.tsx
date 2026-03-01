export const basePath = (locale: string) =>
  locale === "fr"
    ? "/books/les-kiwis-aussi-creusent-des-tunnels"
    : "/books/kiwis-dig-tunnels-too";

export const bookTitle = (locale: string) =>
  locale === "fr"
    ? "Les Kiwis aussi creusent des tunnels"
    : "Kiwis Dig Tunnels Too";

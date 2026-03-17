const frPrepositions: Record<string, string> = {
  Canada: "au",
  Chili: "au",
  Danemark: "au",
  Montenegro: "au",
  "Pays de Galles": "au",
  "Royaume-Uni": "au",
  Açores: "aux",
  "États-Unis d'Amérique": "aux",
  "Île de Man": "à l'",
};

export const getFrenchCountryWithPrep = (country: string): string => {
  const prep = frPrepositions[country] ?? "en";
  return prep === "à l'" ? `à l'${country}` : `${prep} ${country}`;
};

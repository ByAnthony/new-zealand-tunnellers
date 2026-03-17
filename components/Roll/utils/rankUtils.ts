import { Locale } from "@/types/locale";
import { Tunneller } from "@/types/tunnellers";

export const rankCategories: Record<string, string[]> = {
  Officers: ["Major", "Captain", "Lieutenant", "Second Lieutenant"],
  "Non-Commissioned Officers": [
    "Sergeant Major",
    "Company Sergeant Major",
    "Quartermaster Sergeant",
    "Company Quartermaster Sergeant",
    "Sergeant",
    "Corporal",
    "Second Corporal",
  ],
  "Other Ranks": ["Lance Corporal", "Motor Mechanic", "Sapper", "Driver"],
};

const rankCategoriesFr: Record<string, string[]> = {
  Officers: ["Major", "Capitaine", "Lieutenant", "Sous-lieutenant"],
  "Non-Commissioned Officers": [
    "Sergent-major",
    "Sergent-major de compagnie",
    "Sergent quartier-maître",
    "Sergent quartier-maître de compagnie",
    "Sergent",
    "Caporal",
    "Sous-caporal",
  ],
  "Other Ranks": [
    "Caporal suppléant",
    "Mécanicien automobile",
    "Sapeur",
    "Conducteur",
  ],
};

export const rankCategoryTranslationKey: Record<string, string> = {
  Officers: "rankOfficers",
  "Non-Commissioned Officers": "rankNco",
  "Other Ranks": "rankOtherRanks",
};

export const getUniqueRanks = (list: [string, Tunneller[]][]) => {
  return Array.from(
    new Set(list.flatMap(([, lists]) => lists.map((item) => item.rank))),
  );
};

export const getSortedRanks = (list: string[], locale: Locale = "en") => {
  const categories = locale === "en" ? rankCategories : rankCategoriesFr;

  return Object.fromEntries(
    Object.entries(
      list.reduce((acc: Record<string, string[]>, rank) => {
        const category: string | undefined = Object.keys(categories).find(
          (category) => categories[category].includes(rank),
        );

        if (category) {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(rank);
        }

        return acc;
      }, {}),
    )
      .sort(
        ([keyA], [keyB]) =>
          Object.keys(categories).indexOf(keyA) -
          Object.keys(categories).indexOf(keyB),
      )
      .map(([key, value]) => [
        key,
        value.sort(
          (a, b) => categories[key].indexOf(a) - categories[key].indexOf(b),
        ),
      ]),
  );
};

import { Locale } from "@/types/locale";
import { FilterOption, Tunneller } from "@/types/tunnellers";

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

export const getUniqueRanks = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list
    .flatMap(([, lists]) => lists)
    .forEach((item) => {
      if (!seen.has(item.rankId)) {
        seen.add(item.rankId);
        result.push({ id: item.rankId, label: item.rank });
      }
    });

  return result;
};

export const getUniqueRanksEn = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list
    .flatMap(([, lists]) => lists)
    .forEach((item) => {
      if (!seen.has(item.rankId)) {
        seen.add(item.rankId);
        if (item.rankEn) {
          result.push({ id: item.rankId, label: item.rankEn });
        }
      }
    });

  return result;
};

export const getSortedRanks = (
  list: FilterOption[],
  locale: Locale = "en",
): Record<string, FilterOption[]> => {
  const categories = locale === "en" ? rankCategories : rankCategoriesFr;

  return Object.fromEntries(
    Object.entries(
      list.reduce((acc: Record<string, FilterOption[]>, rank) => {
        const category = Object.keys(categories).find((category) =>
          categories[category].includes(rank.label),
        );

        if (category) {
          if (!acc[category]) acc[category] = [];
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
          (a, b) =>
            categories[key].indexOf(a.label) - categories[key].indexOf(b.label),
        ),
      ]),
  );
};

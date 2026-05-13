import { FilterOption, Tunneller } from "@/types/tunnellers";

function addUniqueOccupationCategory(
  result: FilterOption[],
  seen: Set<number | null>,
  id: number | null,
  label: string | null,
) {
  if (id === null || seen.has(id) || !label) return;
  seen.add(id);
  result.push({ id, label });
}

function sortOccupationCategories(options: FilterOption[]): FilterOption[] {
  return [...options].sort((a, b) => {
    if (a.id === null || b.id === null) return a.label.localeCompare(b.label);
    return a.id - b.id;
  });
}

export const getUniqueOccupationCategories = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list.forEach(([, items]) => {
    items.forEach((item) => {
      addUniqueOccupationCategory(
        result,
        seen,
        item.occupationCategoryId ?? null,
        item.occupationCategory ?? null,
      );
    });
  });

  return sortOccupationCategories(result);
};

export const getUniqueOccupationCategoriesEn = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list.forEach(([, items]) => {
    items.forEach((item) => {
      addUniqueOccupationCategory(
        result,
        seen,
        item.occupationCategoryId ?? null,
        item.occupationCategoryEn ?? null,
      );
    });
  });

  return sortOccupationCategories(result);
};

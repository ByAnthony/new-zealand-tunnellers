import { FilterOption, Tunneller } from "@/types/tunnellers";

const MARITAL_STATUS_ORDER = new Map<number | null, number>([
  [1, 0],
  [2, 1],
  [4, 2],
  [3, 3],
]);

function sortMaritalStatuses(options: FilterOption[]): FilterOption[] {
  return [...options].sort((a, b) => {
    const orderA = MARITAL_STATUS_ORDER.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const orderB = MARITAL_STATUS_ORDER.get(b.id) ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return a.label.localeCompare(b.label);
  });
}

function addUniqueMaritalStatus(
  result: FilterOption[],
  seen: Set<number | null>,
  id: number | null,
  label: string | null,
) {
  if (seen.has(id) || !label) return;
  seen.add(id);
  result.push({ id, label });
}

export const getUniqueMaritalStatuses = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list.forEach(([, items]) => {
    items.forEach((item) => {
      const id = item.maritalStatusId;
      if (id === null) return;
      addUniqueMaritalStatus(result, seen, id, item.maritalStatus);
    });
  });

  return sortMaritalStatuses(result);
};

export const getUniqueMaritalStatusesEn = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list.forEach(([, items]) => {
    items.forEach((item) => {
      const id = item.maritalStatusId;
      if (id === null) return;
      addUniqueMaritalStatus(result, seen, id, item.maritalStatusEn);
    });
  });

  return sortMaritalStatuses(result);
};

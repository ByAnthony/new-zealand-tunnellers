import { FilterOption, Tunneller } from "@/types/tunnellers";

export const TUNNELLING_CORPS_ID = null;

export const getUniqueCorps = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list
    .flatMap(([, lists]) => lists)
    .forEach((item) => {
      const id = item.corpsId;
      if (!seen.has(id)) {
        seen.add(id);
        result.push({
          id,
          label: id === null ? "Tunnelling Corps" : (item.attachedCorps ?? ""),
        });
      }
    });

  return result.sort((a, b) => {
    if (a.id === null) return -1;
    if (b.id === null) return 1;
    return a.label.localeCompare(b.label);
  });
};

export const getUniqueCorpsEn = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list
    .flatMap(([, lists]) => lists)
    .forEach((item) => {
      const id = item.corpsId;
      if (!seen.has(id)) {
        if (id !== null && !item.corpsEn) return;
        seen.add(id);
        result.push({
          id,
          label: id === null ? "Tunnelling Corps" : (item.corpsEn ?? ""),
        });
      }
    });

  return result.sort((a, b) => {
    if (a.id === null) return -1;
    if (b.id === null) return 1;
    return a.label.localeCompare(b.label);
  });
};

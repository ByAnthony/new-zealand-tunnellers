import { FilterOption, Tunneller } from "@/types/tunnellers";

export const getUniqueDetachments = (
  list: [string, Tunneller[]][],
): FilterOption[] => {
  const seen = new Set<number | null>();
  const result: FilterOption[] = [];

  list
    .flatMap(([, lists]) => lists)
    .forEach((item) => {
      if (!seen.has(item.detachmentId)) {
        seen.add(item.detachmentId);
        result.push({ id: item.detachmentId, label: item.detachment });
      }
    });

  return result.sort((a, b) => {
    if (a.label === "Main Body" || a.label === "Corps principal") return -1;
    if (b.label === "Main Body" || b.label === "Corps principal") return 1;

    const aMatch =
      a.label.match(/(\d+)(?:st|nd|rd|th) Reinforcements/) ??
      a.label.match(/(\d+)\^(?:er|re|e) renfort/i);
    const bMatch =
      b.label.match(/(\d+)(?:st|nd|rd|th) Reinforcements/) ??
      b.label.match(/(\d+)\^(?:er|re|e) renfort/i);

    if (aMatch && bMatch) {
      return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    }

    return a.label.localeCompare(b.label);
  });
};

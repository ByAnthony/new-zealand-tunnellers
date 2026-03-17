import { Tunneller } from "@/types/tunnellers";

export const getUniqueDetachments = (list: [string, Tunneller[]][]) => {
  return Array.from(
    new Set(list.flatMap(([, lists]) => lists.map((item) => item.detachment))),
  ).sort((a, b) => {
    if (a === "Main Body" || a === "Corps principal") return -1;
    if (b === "Main Body" || b === "Corps principal") return 1;

    const aMatch =
      a.match(/(\d+)(?:st|nd|rd|th) Reinforcements/) ??
      a.match(/(\d+)\^(?:er|re|e) renfort/i);
    const bMatch =
      b.match(/(\d+)(?:st|nd|rd|th) Reinforcements/) ??
      b.match(/(\d+)\^(?:er|re|e) renfort/i);

    if (aMatch && bMatch) {
      return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    }

    return a.localeCompare(b);
  });
};

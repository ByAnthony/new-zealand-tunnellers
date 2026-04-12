export const getParent = (name: string | null, origin: string | null) => {
  return name ? { name, origin } : null;
};

export const getNzResident = (
  month: number | null,
  enlistment: string | null,
  posted: string | null,
) => {
  if (month) {
    const calculateResidentSince = (date: string, month: number) => {
      const match = date.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
      if (!match) {
        const startDate = new Date(date);
        startDate.setUTCMonth(startDate.getUTCMonth() - month);
        return startDate.getUTCFullYear().toString();
      }

      const baseYear = Number(match[1]);
      const baseMonthIndex = Number(match[2]) - 1;
      const totalMonths = baseYear * 12 + baseMonthIndex - month;
      return Math.floor(totalMonths / 12).toString();
    };

    if (enlistment) {
      return calculateResidentSince(enlistment, month);
    }

    if (posted) {
      return calculateResidentSince(posted, month);
    }
  }
  return null;
};

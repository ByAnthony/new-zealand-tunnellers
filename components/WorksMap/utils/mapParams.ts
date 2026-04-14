export function dateToMonth(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 12 + d.getMonth();
}

export function dateToDay(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 86400000);
}

function getLocaleTag(locale: string): string {
  return locale === "en" ? "en-GB" : locale;
}

function parseDateOnlyAsUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function dayToParam(day: number): string {
  return new Date(day * 86400000).toISOString().split("T")[0];
}

export function paramToDay(param: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return null;
  return dateToDay(param);
}

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function monthToParam(month: number): string {
  const year = Math.floor(month / 12);
  const m = (month % 12) + 1;
  return `${year}-${String(m).padStart(2, "0")}`;
}

export function paramToMonth(param: string): number | null {
  const match = param.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 12 + (Number(match[2]) - 1);
}

export function formatDateParam(dateStr: string, locale: string): string {
  return parseDateOnlyAsUTC(dateStr).toLocaleDateString(getLocaleTag(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDay(dayNum: number, locale: string): string {
  return new Date(dayNum * 86400000)
    .toLocaleDateString(getLocaleTag(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatPeriodRange(
  locale: string,
  startDate: string,
  endDate: string,
): string {
  const start = parseDateOnlyAsUTC(startDate);
  const end = parseDateOnlyAsUTC(endDate);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const localeTag = getLocaleTag(locale);

  const startFormatter = new Intl.DateTimeFormat(localeTag, {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });

  const endFormatter = new Intl.DateTimeFormat(localeTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${startFormatter.format(start)} — ${endFormatter.format(end)}`;
}

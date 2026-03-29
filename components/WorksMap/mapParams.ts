export function dateToMonth(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getFullYear() * 12 + d.getMonth();
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

import { DateObj } from "@/types/tunneller";

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function parseDateParts(date: string): DateParts {
  const match = date.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
  }

  const parsed = new Date(date);
  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

export const getYear = (date: string) => {
  return date.slice(0, 4);
};

export const getDayMonth = (date: string) => {
  const { day, month } = parseDateParts(date);

  return `${day} ${ENGLISH_MONTHS[month - 1]}`;
};

export const getDate = (date: string) => {
  const dateObj: DateObj = { year: getYear(date), dayMonth: getDayMonth(date) };
  return dateObj;
};

export const getAge = (
  birthDate: string | null,
  currentDate: string | null,
) => {
  if (birthDate && currentDate) {
    const birth = parseDateParts(birthDate);
    const current = parseDateParts(currentDate);
    let age = current.year - birth.year;
    const monthDiff = current.month - birth.month;
    const dayDiff = current.day - birth.day;

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }
  return null;
};

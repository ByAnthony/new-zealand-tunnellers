import {
  Author,
  ImageArchives,
  ImageBook,
  ImageNewspaper,
  ImageSource,
} from "@/types/tunneller";
import { getDayMonth, getYear } from "@/utils/helpers/date";

export const getImageSourceAucklandLibraries = (reference: string | null) => {
  return reference
    ? `https://digitalnz.org/records?text=${reference}&tab=Images#`
    : null;
};

export const getImageSourceArchives = (
  location: string | null,
  reference: string | null,
) => {
  return location && reference ? { location, reference } : null;
};

export const getImageSourceFamily = (name: string | null) => {
  return name ?? null;
};

export const getImageSourceNewspaper = (
  name: string | null,
  date: string | null,
) => {
  return name && date
    ? { date: `${getDayMonth(date)} ${getYear(date)}`, name }
    : null;
};

export const getImageSourceBookPage = (page: string | null) => {
  return page ? `p.\u00A0${page}` : null;
};

export const getImageSourceBookAuthors = (authors: Author[]) => {
  return authors.map((author: Author) => ({
    forename: author.forename,
    surname: author.surname,
  }));
};

export const getImageSourceBook = (
  authors: Author[] | null,
  title: string | null,
  town: string | null,
  publisher: string | null,
  year: string | null,
  page: string | null,
) => {
  if (title && town && publisher && year) {
    return {
      authors,
      title,
      town,
      publisher,
      year,
      page,
    };
  }
  return null;
};

export const getImageSource = (
  aucklandLibraries: string | null,
  archives: ImageArchives | null,
  family: string | null,
  newspaper: ImageNewspaper | null,
  book: ImageBook | null,
) => {
  return { aucklandLibraries, archives, family, newspaper, book };
};

export const getImage = (url: string | null, source: ImageSource) => {
  return url ? { url, source } : null;
};

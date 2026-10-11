import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ locale: overrideLocale }) => {
  const paramLocale = overrideLocale ?? (await rootParams.locale());
  const locale = hasLocale(routing.locales, paramLocale)
    ? paramLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

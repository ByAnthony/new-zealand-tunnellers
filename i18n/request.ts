import { locale } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ locale: overrideLocale }) => {
  const paramLocale = overrideLocale ?? (await locale());
  const resolvedLocale = hasLocale(routing.locales, paramLocale)
    ? paramLocale
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { ReactNode } from "react";

import { Footer } from "@/components/Footer/Footer";
import { MenuContainer } from "@/components/Menu/MenuContainer";
import { BASE_URL, ogLocale, pageUrl } from "@/utils/helpers/metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    metadataBase: new URL(BASE_URL),
    title: "New Zealand Tunnellers",
    description: t("description"),
    openGraph: {
      title: "New Zealand Tunnellers",
      description: t("description"),
      url: pageUrl(locale, "/"),
      siteName: "New Zealand Tunnellers",
      locale: ogLocale(locale),
      alternateLocale: locale === "fr" ? "en_NZ" : "fr_FR",
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider messages={messages}>
          <MenuContainer />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

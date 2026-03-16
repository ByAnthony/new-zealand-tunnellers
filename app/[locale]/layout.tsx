import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ReactNode } from "react";

import { Footer } from "@/components/Footer/Footer";
import { MenuContainer } from "@/components/Menu/MenuContainer";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    title: "New Zealand Tunnellers",
    description: t("description"),
  };
}

export default async function LocaleLayout({ children }: Props) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <MenuContainer />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}

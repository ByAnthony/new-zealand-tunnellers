import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ReactNode } from "react";

import { Footer } from "@/components/Footer/Footer";
import { MenuContainer } from "@/components/Menu/MenuContainer";

import "../globals.scss";

export const metadata: Metadata = {
  title: "New Zealand Tunnellers",
  description:
    "Discover the history of the New Zealand Tunnellers from the formation of their company to the underground warfare during the First World War",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider messages={messages}>
          <MenuContainer />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

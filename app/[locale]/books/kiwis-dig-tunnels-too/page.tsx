import { getTranslations } from "next-intl/server";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { Locale } from "@/types/locale";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: `${t("book")} - New Zealand Tunnellers` };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <ContentsContainer locale={locale} />;
}

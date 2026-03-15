import { Metadata } from "next";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { Locale } from "@/types/locale";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export const metadata: Metadata = {
  title: "Kiwis Dig Tunnels Too - New Zealand Tunnellers",
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <ContentsContainer locale={locale} />;
}

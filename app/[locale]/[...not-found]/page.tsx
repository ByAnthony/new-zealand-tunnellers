import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Locale } from "@/types/locale";

import NotFound from "../not-found";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "notFound" });

  return {
    title: `${t("title")} - New Zealand Tunnellers`,
    description: t("description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  if (process.env.NODE_ENV === "development") {
    return <NotFound />;
  }

  notFound();
}

import { readdirSync } from "fs";
import { join } from "path";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { Chapter } from "@/components/Books/Chapter/Chapter";
import { Locale } from "@/types/locale";
import { bookTitle } from "@/utils/helpers/books/basePathUtil";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";
import { buildPageMetadata, pageUrl } from "@/utils/helpers/metadata";

export function generateStaticParams() {
  const dir = join(process.cwd(), "contents/books/kiwis-dig-tunnels-too");
  const ids = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));

  return ["en", "fr"].flatMap((locale) => ids.map((id) => ({ locale, id })));
}

type Props = {
  params: Promise<{ id: string; locale: Locale }>;
};

const getTitleFromMarkdown = (md: string): string | null => {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

export async function generateMetadata(props: Props) {
  const { id, locale } = await props.params;
  const markdownContent = await readBookMarkdown(locale, id);
  const t = await getTranslations({ locale, namespace: "site" });
  const chapterTitle = getTitleFromMarkdown(markdownContent) ?? "";
  const title = `${chapterTitle} - New Zealand Tunnellers`;
  const description = t("bookChapterDescription", { title: chapterTitle });

  return buildPageMetadata({
    locale,
    title,
    description,
    path: `/books/kiwis-dig-tunnels-too/${id}/`,
    type: "article",
  });
}

export default async function Page(props: Props) {
  const { id, locale } = await props.params;
  setRequestLocale(locale);
  const markdownContent = await readBookMarkdown(locale, id);
  const chapterTitle = getTitleFromMarkdown(markdownContent) ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: chapterTitle,
    inLanguage: locale,
    isPartOf: {
      "@type": "Book",
      name: bookTitle(locale),
    },
    url: pageUrl(locale, `/books/kiwis-dig-tunnels-too/${id}/`),
    author: {
      "@type": "Person",
      name: "Anthony Byledbal",
    },
    publisher: {
      "@type": "Organization",
      name: "New Zealand Tunnellers",
      url: "https://www.nztunnellers.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Chapter locale={locale} content={markdownContent} />
    </>
  );
}

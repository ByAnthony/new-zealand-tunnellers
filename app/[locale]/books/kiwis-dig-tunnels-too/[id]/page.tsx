import { readdirSync } from "fs";
import { join } from "path";

import { setRequestLocale } from "next-intl/server";

import { Chapter } from "@/components/Books/Chapter/Chapter";
import { Locale } from "@/types/locale";
import { bookFilePath } from "@/utils/helpers/books/basePathUtil";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

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

export function generateStaticParams() {
  const dir = join(process.cwd(), `contents/${bookFilePath("en")}`);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ id: f.replace(/\.md$/, "") }));
}

const getTitleFromMarkdown = (md: string): string | null => {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

export async function generateMetadata(props: Props) {
  const { id, locale } = await props.params;
  const markdownContent = await readBookMarkdown(locale, id);
  const title = getTitleFromMarkdown(markdownContent);
  return {
    title: `${title} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const { id, locale } = await props.params;
  setRequestLocale(locale);
  const markdownContent = await readBookMarkdown(locale, id);
  return <Chapter locale={locale} content={markdownContent} />;
}

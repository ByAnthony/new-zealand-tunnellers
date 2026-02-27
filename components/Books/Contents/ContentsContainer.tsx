import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

import { Contents } from "./Contents";

type Props = {
  locale: string;
};

export default async function ContentsContainer({ locale }: Props) {
  const filename = locale === "fr" ? "sommaire" : "contents";
  const markdownContent = await readBookMarkdown(locale, filename);

  return <Contents locale={locale} content={markdownContent} />;
}

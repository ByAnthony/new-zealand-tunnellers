import fs from "fs/promises";
import path from "path";

import { localePath } from "@/utils/helpers/books/basePathUtil";

import { Contents } from "./Contents";

type Props = {
  locale: string;
};

const getMarkdownFile = async (locale: string) => {
  const contents = (locale: string) => {
    return locale === "fr" ? "sommaire" : "contents";
  };

  const filePath = path.join(
    process.cwd(),
    `./contents/${localePath(locale)}`,
    `${contents(locale)}.md`,
  );
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Chapter data: ${errorMessage}`);
  }
};

export default async function ContentsContainer({ locale }: Props) {
  const markdownContent = await getMarkdownFile(locale);

  return <Contents locale={locale} content={markdownContent} />;
}

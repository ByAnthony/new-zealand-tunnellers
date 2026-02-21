import fs from "fs/promises";
import path from "path";

import { localePath } from "@/utils/helpers/books/basePathUtil";
import { Chapter } from "@/components/Books/Chapter/Chapter";

type Props = {
  params: Promise<{ id: string }>;
};

const getMarkdownFile = async (locale: string, id: string) => {
  const filePath = path.join(
    process.cwd(),
    `./contents/books/${localePath(locale)}`,
    `${id}.md`,
  );
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Chapter data: ${errorMessage}`);
  }
};

export default async function Page(props: Props) {
  const { id } = await props.params;
  const markdownContent = await getMarkdownFile("fr", id);

  return <Chapter locale="fr" content={markdownContent} />;
}

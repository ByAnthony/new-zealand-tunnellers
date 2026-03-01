import fs from "fs/promises";
import path from "path";

import { basePath } from "./basePathUtil";

export const readBookMarkdown = async (
  locale: string,
  filename: string,
): Promise<string> => {
  const filePath = path.join(
    process.cwd(),
    `./contents/${basePath(locale)}`,
    `${filename}.md`,
  );
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return fileContent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read markdown file: ${errorMessage}`);
  }
};

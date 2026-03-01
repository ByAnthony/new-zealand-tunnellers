import { Chapter } from "@/components/Books/Chapter/Chapter";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

type Props = {
  params: Promise<{ id: string }>;
};

const getTitleFromMarkdown = (md: string): string | null => {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

const getMarkdown = async (props: Props) => {
  const { id } = await props.params;
  try {
    const markdownContent = await readBookMarkdown("en", id);
    return markdownContent;
  } catch (error) {
    console.error("Error fetching markdown content:", error);
    throw new Error("Failed to load chapter content.");
  }
};

export async function generateMetadata(props: Props) {
  const markdownContent = await getMarkdown(props);

  const title = getTitleFromMarkdown(markdownContent);

  return {
    title: `${title} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const markdownContent = await getMarkdown(props);

  return <Chapter locale="en" content={markdownContent} />;
}

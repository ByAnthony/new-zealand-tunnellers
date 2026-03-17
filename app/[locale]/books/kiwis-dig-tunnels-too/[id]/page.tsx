import { Chapter } from "@/components/Books/Chapter/Chapter";
import { Locale } from "@/types/locale";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

type Props = {
  params: Promise<{ id: string; locale: Locale }>;
};

const getTitleFromMarkdown = (md: string): string | null => {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

const getMarkdown = async (props: Props) => {
  const { id, locale } = await props.params;
  try {
    const markdownContent = await readBookMarkdown(locale, id);
    return { markdownContent, locale };
  } catch (error) {
    console.error("Error fetching markdown content:", error);
    throw new Error("Failed to load chapter content.");
  }
};

export async function generateMetadata(props: Props) {
  const { markdownContent } = await getMarkdown(props);
  const title = getTitleFromMarkdown(markdownContent);
  return {
    title: `${title} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const { markdownContent, locale } = await getMarkdown(props);
  return <Chapter locale={locale} content={markdownContent} />;
}

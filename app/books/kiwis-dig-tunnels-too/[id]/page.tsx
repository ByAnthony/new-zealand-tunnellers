import { Chapter } from "@/components/Books/Chapter/Chapter";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: Props) {
  const { id } = await props.params;
  const markdownContent = await readBookMarkdown("en", id);

  return <Chapter locale="en" content={markdownContent} />;
}

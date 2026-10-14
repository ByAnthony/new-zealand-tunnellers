import { cookies } from "next/headers";

import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";
import { offlineBookSavedKey } from "@/utils/helpers/books/offlineBookSavedKey";

import { Contents } from "./Contents";

type Props = {
  locale: string;
};

export default async function ContentsContainer({ locale }: Props) {
  const filename = "contents";
  const markdownContent = await readBookMarkdown(locale, filename);
  const cookieStore = await cookies();
  const initiallySaved =
    cookieStore.get(offlineBookSavedKey(locale))?.value === "true";

  return (
    <Contents
      locale={locale}
      content={markdownContent}
      initiallySaved={initiallySaved}
    />
  );
}

import { ReactNode } from "react";
import Link from "next/link";

import {
  extractText,
  parseChapterHeading,
} from "@/utils/helpers/books/titleUtil";

export const Heading1: React.FC<{
  children: ReactNode;
  className?: string;
  styles: Record<string, string>;
  locale: string;
}> = ({ children, styles, locale }) => {
  const title = extractText(children).trim();
  const chapter = parseChapterHeading(title, locale);

  return (
    <div className={styles.header}>
      <div className={styles.link}>
        <Link href="/#history">Resources</Link>
        <h1>
          {chapter !== null && (
            <>
              <div className={styles["chapitre-number"]}>
                {locale === "fr" ? "Chapitre" : "Chapter"} {chapter.number}
              </div>
              <span>{chapter.text || null}</span>
            </>
          )}
          {chapter === null && title}
        </h1>
      </div>
    </div>
  );
};

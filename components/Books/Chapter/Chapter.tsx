"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import { ReadingProgress } from "@/components/Books/ReadingProgress/ReadingProgress";
import { HowToCite } from "@/components/HowToCite/HowToCite";
import { basePath, bookTitle } from "@/utils/helpers/books/basePathUtil";
import {
  calculateReadingTime,
  extractText,
  formatHeading,
  parseChapterHeading,
  rehypeRemoveFootnoteBackrefs,
} from "@/utils/helpers/books/titleUtil";

import STYLES from "./Chapter.module.scss";
import { ImageZoom } from "../ImageZoom/ImageZoom";

type Props = {
  locale: string;
  content: string;
};

const MainTitle: React.FC<{
  children: ReactNode;
  locale: string;
  readingTime?: number;
}> = ({ children, locale, readingTime }) => {
  const title = extractText(children).trim();
  const chapter = parseChapterHeading(title, locale);

  return (
    <>
      <div className={STYLES.header}>
        <div className={STYLES.link}>
          <Link
            href="/#resources"
            aria-label={
              locale === "fr"
                ? "Aller à la section Ressources"
                : "Go to the Resources section"
            }
          >
            Resources
          </Link>{" "}
          /{" "}
          <Link
            href={basePath(locale)}
            aria-label={
              locale === "fr"
                ? "Aller à la table des matières"
                : "Go to the table of contents"
            }
          >
            {bookTitle(locale)}
          </Link>
        </div>
        <div className={STYLES["main-title"]}>
          <h1>{chapter !== null ? chapter.text : title}</h1>
          {chapter?.number && (
            <div className={STYLES["title-line-3"]}>
              {locale === "fr" ? "Chapitre" : "Chapter"} {chapter?.number}
            </div>
          )}
        </div>
      </div>
      {readingTime !== undefined && (
        <div className={STYLES["reading-time"]}>
          {readingTime} {locale === "fr" ? "min de lecture" : "min read"}
        </div>
      )}
    </>
  );
};

const FootnoteLink: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }
> = ({ href, children, ...props }) => {
  const isFootnoteRef =
    typeof href === "string" &&
    (href.includes("#user-content-fn-") ||
      href.includes("#user-content-fnref-"));

  if (!isFootnoteRef)
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );

  return (
    <a className={`${STYLES.footnote} anchor-link`} href={href} {...props}>
      [{children}]
    </a>
  );
};

const FootnoteItem: React.FC<
  { node?: any; children?: ReactNode } & React.LiHTMLAttributes<HTMLLIElement>
> = ({ node, children, ...props }) => {
  const id = (node?.properties?.id as string) ?? "";
  const m = id.match(/(?:user-content-)?fn-(\d+)/);
  if (!m) return <li {...props}>{children}</li>;

  const number = m[1];
  const arr = React.Children.toArray(children);
  const first = arr[0];

  let inlineContent = children;

  if (React.isValidElement(first) && (first as any).type === "p") {
    // unwrap the p so it becomes inline content
    inlineContent = (first as any).props.children;
    // include any siblings after the <p> just in case
    if (arr.length > 1) inlineContent = [inlineContent, ...arr.slice(1)];
  }

  return (
    <li {...props} className={STYLES.footnotes}>
      <a href={`#user-content-fnref-${number}`} className="anchor-link">
        {number}.
      </a>{" "}
      {inlineContent}
    </li>
  );
};

function isReadingPage(pathname: string): boolean {
  if (
    pathname.includes("/sources") ||
    pathname.includes("/bibliograph") ||
    pathname.includes("/acknowledgments") ||
    pathname.includes("/remerciements")
  )
    return false;
  return true;
}

export const Chapter = (props: Props) => {
  const pathname = usePathname();
  const readingTime = isReadingPage(pathname)
    ? calculateReadingTime(props.content)
    : undefined;

  return (
    <div className={STYLES.container}>
      {isReadingPage(pathname) && <ReadingProgress />}
      <div className={STYLES.text}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkRemoveComments]}
          rehypePlugins={[rehypeRaw, rehypeRemoveFootnoteBackrefs]}
          components={{
            h1: ({ children }) => (
              <MainTitle locale={props.locale} readingTime={readingTime}>
                {children}
              </MainTitle>
            ),
            h2: ({ children }) => formatHeading(children),
            img: (props) => <ImageZoom {...props} />,
            a: (props) => <FootnoteLink {...props} />,
            li: (props) => <FootnoteItem {...props} />,
          }}
        >
          {props.content}
        </ReactMarkdown>
      </div>
      {isReadingPage(pathname) && (
        <HowToCite pathname={pathname} locale={props.locale} />
      )}
    </div>
  );
};

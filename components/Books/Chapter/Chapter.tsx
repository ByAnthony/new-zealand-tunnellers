"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import { BookMenu } from "@/components/Books/BookMenu/BookMenu";
import { ReadingProgress } from "@/components/Books/ReadingProgress/ReadingProgress";
import { HowToCite } from "@/components/HowToCite/HowToCite";
import { basePath } from "@/utils/helpers/books/basePathUtil";
import {
  calculateReadingTime,
  extractText,
  formatHeading,
  parseChapterHeading,
  rehypeRemoveFootnoteBackrefs,
} from "@/utils/helpers/books/titleUtil";

import STYLES from "./Chapter.module.scss";
import { ImageZoom } from "../ImageZoom/ImageZoom";

// Builds the same flattened list of children as React.Children.toArray
// (nested arrays/iterables traversed, nullish/boolean children skipped)
// without the passed-key rewriting that toArray performs.
function flattenChildren(
  children: ReactNode,
): Exclude<ReactNode, null | undefined | boolean>[] {
  const items: Exclude<ReactNode, null | undefined | boolean>[] = [];
  const walk = (node: ReactNode) => {
    if (node === null || node === undefined || typeof node === "boolean")
      return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (
      typeof node === "object" &&
      Symbol.iterator in (node as Record<symbol, unknown> | Iterable<ReactNode>)
    ) {
      for (const child of node as Iterable<ReactNode>) walk(child);
      return;
    }
    items.push(node as Exclude<ReactNode, null | undefined | boolean>);
  };
  walk(children);
  return items;
}

type Props = {
  locale: string;
  slug: string;
  content: string;
};

const MainTitle: React.FC<{
  children: ReactNode;
  locale: string;
  slug: string;
  readingTime?: number;
}> = ({ children, locale, slug, readingTime }) => {
  const t = useTranslations("books");
  const title = extractText(children).trim();
  const chapter = parseChapterHeading(title, locale);

  const isPrologueOrEpilogue = slug === "prologue" || slug === "epilogue";
  const vignetteName = chapter
    ? `vignette-${chapter.number}`
    : readingTime !== undefined && isPrologueOrEpilogue
      ? `vignette-${slug}`
      : undefined;

  return (
    <>
      <div className={STYLES.header}>
        <div className={STYLES.link}>
          {/* Intentionally using an anchor tag instead of <Link>
              to ensure proper navigation for offline contents */}
          <a href={basePath(locale)} aria-label={t("goToTableOfContents")}>
            {t("title")}
          </a>
        </div>
        <div className={STYLES["main-title"]}>
          {vignetteName && (
            <Image
              src={`/images/books/${vignetteName}.png`}
              className={STYLES.vignette}
              alt=""
              width={120}
              height={100}
              priority={true}
              placeholder="empty"
            />
          )}
          <h1>{chapter !== null ? chapter.text : title}</h1>
          {chapter?.number && (
            <div className={STYLES["title-line-3"]}>
              {t("chapter")} {chapter?.number}
            </div>
          )}
        </div>
      </div>
      {readingTime !== undefined && (
        <div className={STYLES["reading-time"]}>
          {readingTime} {t("minRead")}
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
  const arr = flattenChildren(children);
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
    pathname.includes("sources") ||
    pathname.includes("bibliograph") ||
    pathname.includes("acknowledgments") ||
    pathname.includes("remerciements")
  )
    return false;
  return true;
}

export const Chapter = (props: Props) => {
  // Built from props so static HTML and hydration share the public URL.
  const pathname = `${basePath(props.locale)}${props.slug}/`;
  const readingTime = isReadingPage(pathname)
    ? calculateReadingTime(props.content)
    : undefined;
  const chapterTitleMatch = props.content.match(/^#\s+(.+)$/m);
  const chapterTitle = chapterTitleMatch
    ? chapterTitleMatch[1].trim()
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
              <MainTitle
                locale={props.locale}
                slug={props.slug}
                readingTime={readingTime}
              >
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
        <HowToCite
          pathname={pathname}
          locale={props.locale}
          chapterTitle={chapterTitle}
        />
      )}
      {isReadingPage(pathname) && <BookMenu locale={props.locale} />}
    </div>
  );
};

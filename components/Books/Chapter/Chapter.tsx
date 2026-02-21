"use client";

import Link from "next/link";
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import {
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
  className?: string;
  locale: string;
}> = ({ children, locale }) => {
  const title = extractText(children).trim();
  const chapter = parseChapterHeading(title, locale);

  return (
    <div className={STYLES.header}>
      <div className={STYLES.link}>
        <Link href="/#history">Resources</Link> /{" "}
        {locale === "fr"
          ? "Les Kiwis aussi creusent des tunnels"
          : "The Kiwis Dig Tunnels Too"}
      </div>
      <div className={STYLES["main-title"]}>
        <h1>{chapter !== null ? chapter.text : title}</h1>
      </div>
      {chapter?.number && (
        <div className={STYLES["title-line-3"]}>
          {locale === "fr" ? "Chapitre" : "Chapter"} {chapter?.number}
        </div>
      )}
    </div>
  );
};

export const Chapter = (props: Props) => {
  return (
    <div className={STYLES.container}>
      <div className={STYLES.text}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkRemoveComments]}
          rehypePlugins={[rehypeRaw, rehypeRemoveFootnoteBackrefs]}
          components={{
            h1: ({ children }) => (
              <MainTitle locale={props.locale}>{children}</MainTitle>
            ),
            h2: ({ children }) => formatHeading(children),
            img: (props) => <ImageZoom {...props} />,
            a: ({ href, children, ...props }) => {
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
                <a
                  className={`${STYLES.footnote} anchor-link`}
                  href={href}
                  {...props}
                >
                  [{children}]
                </a>
              );
            },
            li: ({ node, children, ...props }: any) => {
              const id = (node?.properties?.id as string) ?? "";
              const m = id.match(/(?:user-content-)?fn-(\d+)/);
              if (!m) return <li {...props}>{children}</li>;

              const number = m[1];

              // children is typically [ <p>...</p> ]
              const arr = React.Children.toArray(children);
              const first = arr[0];

              let inlineContent = children;

              if (React.isValidElement(first) && (first as any).type === "p") {
                // unwrap the p so it becomes inline content
                inlineContent = (first as any).props.children;
                // include any siblings after the <p> just in case
                if (arr.length > 1)
                  inlineContent = [inlineContent, ...arr.slice(1)];
              }

              return (
                <li {...props} className={STYLES.footnotes}>
                  <a
                    href={`#user-content-fnref-${number}`}
                    className="anchor-link"
                  >
                    {number}.
                  </a>{" "}
                  {inlineContent}
                </li>
              );
            },
          }}
        >
          {props.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

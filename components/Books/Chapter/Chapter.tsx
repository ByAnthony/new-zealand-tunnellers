"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import {
  formatHeading,
  rehypeRemoveFootnoteBackrefs,
} from "@/utils/helpers/books/titleUtil";

import STYLES from "./Chapter.module.scss";
import { Heading1 } from "./Heading1";
import { ImageZoom } from "../ImageZoom/ImageZoom";

type Props = {
  locale: string;
  content: string;
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
              <Heading1 styles={STYLES} locale={props.locale}>
                {children}
              </Heading1>
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

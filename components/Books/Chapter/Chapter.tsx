"use client";

import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkRemoveComments from "remark-remove-comments";

import STYLES from "./Chapter.module.scss";
import {
  formatHeading,
  Header,
  rehypeRemoveFootnoteBackrefs,
} from "@/utils/helpers/books/titleUtil";
import { ImageZoom } from "../ImageZoom/ImageZoom";
import React from "react";

type Props = {
  locale: string;
  content: string;
};

export const Chapter = (props: Props) => {
  const pathname = usePathname();

  const isEnableProgress =
    !pathname.includes("sources") &&
    !pathname.includes("bibliographie") &&
    !pathname.includes("bibliography") &&
    !pathname.includes("remerciements") &&
    !pathname.includes("acknowledgments") &&
    !pathname.includes("mentions-legales") &&
    !pathname.includes("legal-notices");

  return (
    <div className={STYLES.container}>
      <div className={STYLES.text}>
        <div className={STYLES["text-content"]}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkRemoveComments]}
            rehypePlugins={[rehypeRaw, rehypeRemoveFootnoteBackrefs]}
            components={{
              h1: ({ children }) => (
                <Header styles={STYLES} locale={props.locale}>
                  {children}
                </Header>
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
                  <a className={STYLES.footnote} href={href} {...props}>
                    [{children}]
                  </a>
                );
              },

              li: ({ node, children, ...props }: any) => {
                const id = (node?.properties?.id as string) ?? "";
                const m = id.match(/(?:user-content-)?fn-(\d+)/);
                if (!m) return <li {...props}>{children}</li>;

                const number = m[1];

                // If footnote content is wrapped in <p>, unwrap it so it stays inline
                const arr = React.Children.toArray(children);
                const first = arr[0];

                let content = children;

                if (
                  React.isValidElement(first) &&
                  (first as any).type === "p"
                ) {
                  content = (first as any).props.children; // unwrap <p>...</p>
                  // If there can be more siblings after <p>, you can append them too:
                  if (arr.length > 1) content = [content, ...arr.slice(1)];
                }

                return (
                  <li {...props} className={STYLES.footnoteItem}>
                    <a
                      href={`#user-content-fnref-${number}`}
                      className={STYLES.footnoteNumber}
                    >
                      {number}.
                    </a>{" "}
                    <span className={STYLES.footnoteText}>{content}</span>
                  </li>
                );
              },
            }}
          >
            {props.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

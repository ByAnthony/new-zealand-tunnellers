"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";

import type { Summary } from "@/types/tunneller";
import { displayBiographyDates } from "@/utils/helpers/roll";

import STYLES from "./HowToCite.module.scss";

type Props = {
  id?: number;
  summary?: Summary;
  title?: string;
  timeline?: boolean;
};

type HowToCiteUrlProps = {
  id?: number;
  title?: string;
  timeline?: boolean;
};

type HowToCiteTitleProps = {
  tunneller?: Summary;
  title?: string;
  timeline?: boolean;
};

export function HowToCiteUrl({ id, title, timeline }: HowToCiteUrlProps) {
  return (
    <span>
      URL: www.
      <wbr />
      nztunnellers
      <wbr />
      .com/
      <wbr />
      {id && !timeline && (
        <>
          tunnellers/
          <wbr />
          {id}
        </>
      )}
      {id && timeline && (
        <>
          tunnellers/
          <wbr />
          {id}
          /
          <wbr />
          wwi-
          <wbr />
          timeline
        </>
      )}
      {!id && title && (
        <>
          history/
          <wbr />
          {title
            ?.replace(/\s+|\\/g, "-")
            .replace(/&/g, "and")
            .toLowerCase()}
        </>
      )}
    </span>
  );
}

function HowToCiteTitle({ tunneller, title, timeline }: HowToCiteTitleProps) {
  if (tunneller && !timeline) {
    return (
      <>
        {`${tunneller.name.forename} ${tunneller.name.surname} `}
        {`(${displayBiographyDates(tunneller.birth, tunneller.death)})`}
      </>
    );
  }
  if (tunneller && timeline) {
    return (
      <>
        World War I Timeline of
        {` ${tunneller.name.forename} ${tunneller.name.surname}`}
      </>
    );
  }
  const articleTitle = title?.replace(/\\/g, " ");
  return <span>{articleTitle}</span>;
}

export function HowToCite({ id, summary, title, timeline }: Props) {
  const citationRef = useRef<HTMLParagraphElement>(null);

  const now = useMemo(() => new Date(), []);
  const userTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: userTimeZone,
      }).format(now),
    [now, userTimeZone],
  );
  const currentYear = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        timeZone: userTimeZone,
      }).format(now),
    [now, userTimeZone],
  );

  const handleCopy = () => {
    if (citationRef.current) {
      const citationText = citationRef.current.innerText;
      navigator.clipboard
        .writeText(citationText)
        .then(() => {
          alert("How to cite has been copied to clipboard");
        })
        .catch((err) => {
          alert(
            "Failed to copy to clipboard. Please try selecting and copying the text manually.",
          );
          // Only log errors in development
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to copy: ", err);
          }
        });
    }
  };

  return (
    <div className={STYLES.howtocite}>
      <h3>
        How to cite this page
        <button className={STYLES["copy-paste"]} onClick={handleCopy}>
          <Image
            src={`/copy.png`}
            alt="Copy to clipboard"
            width={13}
            height={16}
            placeholder="empty"
          />
        </button>
      </h3>
      <p ref={citationRef}>
        Anthony Byledbal, &ldquo;
        <HowToCiteTitle tunneller={summary} title={title} timeline={timeline} />
        &ldquo;, <em>New Zealand Tunnellers Website</em>
        {`, ${currentYear} (2009), Accessed: `}
        {currentDate}
        {". "}
        <HowToCiteUrl id={id} title={title} timeline={timeline} />
      </p>
    </div>
  );
}

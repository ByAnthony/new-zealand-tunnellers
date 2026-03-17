"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ImageSource, Author } from "@/types/tunneller";

import STYLES from "./ProfileImageSource.module.scss";

type Props = {
  source: ImageSource | undefined;
};

function SourceImage({
  imageSource,
}: {
  imageSource: ImageSource | undefined;
}) {
  const t = useTranslations("profile");
  const title = <h3>{t("photograph")}</h3>;
  if (imageSource?.archives) {
    return (
      <div className={STYLES.sources}>
        {title}
        <p>{`${imageSource.archives.location}, ${imageSource.archives.reference}.`}</p>
      </div>
    );
  }
  if (imageSource?.aucklandLibraries) {
    const displayReference = (url: string) =>
      url.slice(url.indexOf("=") + 1, url.indexOf("&"));
    return (
      <div className={STYLES.sources}>
        {title}
        <p>
          {t("imageSourceAucklandLibraries")}{" "}
          <Link href={`${imageSource.aucklandLibraries}`}>
            {displayReference(imageSource.aucklandLibraries)}
          </Link>
          .
        </p>
      </div>
    );
  }
  if (imageSource?.family) {
    return (
      <div className={STYLES.sources}>
        {title}
        <p>{t("imageSourceFamily", { name: imageSource.family })}.</p>
      </div>
    );
  }
  if (imageSource?.newspaper) {
    return (
      <div className={STYLES.sources}>
        {title}
        <p>
          <em>{imageSource?.newspaper.name}</em>
          {`, ${imageSource?.newspaper.date}.`}
        </p>
      </div>
    );
  }
  if (imageSource?.book) {
    const displayAuthors = (authors: Author[] | null) => {
      if (authors) {
        if (authors.length === 2) {
          return `${authors[0].forename} ${authors[0].surname} ${t("and")} ${authors[1].forename} ${authors[1].surname}, `;
        }
        return `${authors[0].forename} ${authors[0].surname}, `;
      }
    };
    const displayPage = (page: string | null) => {
      if (page) {
        return `, ${page}`;
      }
      return "";
    };
    return (
      <div className={STYLES.sources}>
        {title}
        <p>
          {displayAuthors(imageSource.book.authors)}
          <em>{imageSource.book.title}</em>
          {`, ${imageSource.book.town}, ${imageSource.book.publisher}, ${imageSource.book.year}${displayPage(imageSource.book.page)}.`}
        </p>
      </div>
    );
  }
  return null;
}

export function ProfileImageSource({ source }: Props) {
  return <SourceImage imageSource={source} />;
}

"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ArticleNextChapterButton } from "@/components/Article/ArticleNextChapterButton/ArticleNextChapterButton";
import { ArticleNotes } from "@/components/Article/ArticleNotes/ArticleNotes";
import { Content } from "@/components/Article/Content/Content";
import { TopImage } from "@/components/Article/TopImage/TopImage";
import { HowToCite } from "@/components/HowToCite/HowToCite";
import { Title } from "@/components/Title/Title";
import { Chapter } from "@/types/article";

import STYLES from "./Article.module.scss";

type Props = {
  article: Chapter;
};

export function Article({ article }: Props) {
  useEffect(() => {
    localStorage.removeItem("filters");
    localStorage.removeItem("page");
    localStorage.removeItem("roll:scrollY");
  }, []);

  return (
    <div className={STYLES.container}>
      <div className={STYLES.header}>
        <div className={STYLES.link}>
          <Link href="/#history">History</Link>
        </div>
        <Title title={article.title} subTitle={article.chapter} />
      </div>
      <TopImage image={article.image[0]} />
      <Content
        imageList={article.image.slice(1)}
        sectionList={article.section}
      />
      <ArticleNextChapterButton chapter={article.next} />
      <ArticleNotes notes={article.notes} />
      <HowToCite title={article.title} />
    </div>
  );
}

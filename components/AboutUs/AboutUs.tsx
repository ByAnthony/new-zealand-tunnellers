"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Paragraph } from "@/components/Article/Paragraph/Paragraph";
import { Title } from "@/components/Title/Title";
import { AboutUsArticle } from "@/types/article";

import STYLES from "./AboutUs.module.scss";

type Props = {
  article: AboutUsArticle;
};

export function AboutUs({ article }: Props) {
  const t = useTranslations("aboutUs");

  useEffect(() => {
    localStorage.removeItem("filters");
    localStorage.removeItem("page");
    localStorage.removeItem("roll:scrollY");
  }, []);

  return (
    <div className={STYLES.container}>
      <div className={STYLES.header}>
        <Title title={article.title} />
      </div>
      <Paragraph section={article.section[0]} />
      <div className={STYLES["image-container"]}>
        <Image
          src={`/images/about-us/${article.image[0].file}`}
          alt={article.image[0].alt}
          width={800}
          height={575}
          className={STYLES.image}
          placeholder="empty"
        />
      </div>
      <div className={STYLES["get-in-touch"]}>
        <Paragraph section={article.section[2]} />
        <div className={STYLES["contact-buttons"]}>
          <button
            type="button"
            className={STYLES.email}
            onClick={() => window.open("mailto:info@nztunnellers.com")}
            aria-label={t("contactByEmail")}
          >
            {t("email")}
          </button>
          <button
            type="button"
            className={STYLES.linkedin}
            onClick={() =>
              window.open("https://www.linkedin.com/in/anthony-byledbal/")
            }
            aria-label={t("contactOnLinkedIn")}
          >
            {t("linkedIn")}
          </button>
        </div>
      </div>
      <Paragraph section={article.section[1]} />
    </div>
  );
}

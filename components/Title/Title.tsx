"use client";

import { useTranslations } from "next-intl";

import { Name } from "@/types/tunnellers";

import STYLES from "./Title.module.scss";

type TwoLineTitleProps = {
  title: string | undefined;
  name: Name | undefined;
};

type SubTitleProps = {
  subTitle: number | string | undefined;
};

type Props = {
  title?: string;
  name?: Name;
  subTitle?: number | string;
};

function TwoLineTitle({ title, name }: TwoLineTitleProps) {
  const isTitle = (string: string) => {
    const split = string.split("\\");
    return split;
  };

  return (
    <h1>
      {title ? (
        <>
          <span className={STYLES["title-line-1"]}>{isTitle(title)[0]}</span>
          <span className={STYLES["title-line-2"]}>{isTitle(title)[1]}</span>
        </>
      ) : (
        <>
          <span className={STYLES.forename}>{name?.forename} </span>
          <span className={STYLES.surname}>{name?.surname}</span>
        </>
      )}
    </h1>
  );
}

function SubTitle({ subTitle }: SubTitleProps) {
  const t = useTranslations("article");

  if (subTitle) {
    return (
      <h2 className={STYLES["title-line-3"]}>
        {typeof subTitle === "string"
          ? subTitle
          : t("chapter", { chapter: subTitle })}
      </h2>
    );
  }
  return null;
}

export function Title({
  title = undefined,
  name = undefined,
  subTitle = undefined,
}: Props) {
  return (
    <>
      <div className={STYLES["main-title"]}>
        <TwoLineTitle title={title} name={name} />
      </div>
      <SubTitle subTitle={subTitle} />
    </>
  );
}

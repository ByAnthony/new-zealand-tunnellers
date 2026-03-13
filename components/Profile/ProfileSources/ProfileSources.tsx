"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import type {
  LondonGazette,
  NominalRoll,
  NzArchives,
  Sources,
} from "@/types/tunneller";

import STYLES from "./ProfileSources.module.scss";

type Props = {
  sources: Sources;
};

type RecordWithIbid<T> = T & { ibid: string };

function addIbid<T extends Record<string, string>>(
  array: T[],
  index: number,
  ibid: string,
): RecordWithIbid<T>[] {
  return array.slice(index).map((obj) => ({ ...obj, ibid }));
}

function AwmmSource({
  awmmCenotaph,
  prefix,
  linkLabel,
}: {
  awmmCenotaph: string | null;
  prefix: string;
  linkLabel: string;
}) {
  if (awmmCenotaph) {
    return (
      <p>
        {prefix}
        <Link href={awmmCenotaph} target="_blank" rel="noopener noreferrer">
          {linkLabel}
        </Link>
        .
      </p>
    );
  }
  return null;
}

function NzArchivesSource({
  nzArchives,
  prefix,
  ibidLabel,
  fileLabel,
}: {
  nzArchives: NzArchives[];
  prefix: string;
  ibidLabel: string;
  fileLabel: string;
}) {
  const nzArchivesList = [
    ...addIbid([nzArchives[0]], 0, prefix),
    ...addIbid(nzArchives, 1, ibidLabel),
  ];
  const italicIbid = (ibid: string) =>
    ibid === ibidLabel ? <em>{ibid}</em> : ibid;
  return (
    <>
      {nzArchivesList.map((archives) => (
        <p key={archives.reference}>
          {italicIbid(archives.ibid)}
          {`${archives.reference}, `}
          <Link href={archives.url} target="_blank" rel="noopener noreferrer">
            {fileLabel}
          </Link>
          .
        </p>
      ))}
    </>
  );
}

function LondonGazetteSource({
  londonGazette,
  prefix,
  ibidLabel,
}: {
  londonGazette: LondonGazette[];
  prefix: string;
  ibidLabel: string;
}) {
  if (londonGazette.length !== 0) {
    const LondonGazetteList = [
      ...addIbid([londonGazette[0]], 0, prefix),
      ...addIbid(londonGazette, 1, ibidLabel),
    ];
    return (
      <>
        {LondonGazetteList.map((gazette) => (
          <p key={gazette.page}>
            <em>{gazette.ibid}</em>
            {`${gazette.date}, p. ${gazette.page}`}.
          </p>
        ))}
      </>
    );
  }
  return null;
}

function NominalRollSource({ nominalRoll }: { nominalRoll: NominalRoll }) {
  const title = `${nominalRoll.title}`;
  const volumeRoll = `, ${nominalRoll.volume}, ${nominalRoll.roll}`;
  const reference = `, ${nominalRoll.publisher}, ${nominalRoll.town}, ${nominalRoll.date}, ${nominalRoll.page}.`;
  if (nominalRoll.volume && nominalRoll.roll) {
    return (
      <p>
        <em>{title}</em>
        {`${volumeRoll}${reference}`}
      </p>
    );
  }
  return (
    <p>
      <em>{title}</em>
      {reference}
    </p>
  );
}

export function ProfileSources({ sources }: Props) {
  const t = useTranslations("profile");

  return (
    <div className={STYLES.sources}>
      <h2>{t("sources")}</h2>
      <AwmmSource
        awmmCenotaph={sources.awmmCenotaph}
        prefix={t("awmmPrefix")}
        linkLabel={t("awmmLink")}
      />
      <NzArchivesSource
        nzArchives={sources.nzArchives}
        prefix={t("nzArchivesPrefix")}
        ibidLabel={t("ibid")}
        fileLabel={t("militaryPersonnelFile")}
      />
      <LondonGazetteSource
        londonGazette={sources.londonGazette}
        prefix={t("londonGazette")}
        ibidLabel={t("ibid")}
      />
      <NominalRollSource nominalRoll={sources.nominalRoll} />
    </div>
  );
}

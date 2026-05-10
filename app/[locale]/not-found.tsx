import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import STYLES from "./not-found.module.scss";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  const homepageHref = locale === "en" ? "/" : `/${locale}`;

  return (
    <>
      <style>{`footer { display: none; }`}</style>
      <section className={STYLES.container}>
        <div className={STYLES.copy}>
          <p className={STYLES.code}>404</p>
          <h1>{t("title")}</h1>
          <p className={STYLES.description}>{t("description")}</p>
          <Link className={STYLES.link} href={homepageHref}>
            {t("home")}
          </Link>
        </div>
      </section>
    </>
  );
}

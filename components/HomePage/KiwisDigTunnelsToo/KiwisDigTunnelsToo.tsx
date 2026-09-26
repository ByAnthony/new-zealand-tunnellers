import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import STYLES from "./KiwisDigTunnelsToo.module.scss";
import { BookOpenBadge } from "../../WorksMap/MapControls/RelatedChapterCard/RelatedChapterCard";

export function KiwisDigTunnelsToo() {
  const t = useTranslations("homepage");
  const router = useRouter();

  return (
    <section className={STYLES.container} aria-labelledby="resources-title">
      <h2>{t("read")}</h2>
      <div className={STYLES.title}>{t("bookTitle")}</div>
      <div className={STYLES["book-meta"]}>
        <span className={STYLES.by}>{t("bookBy")}</span>
        <span className={STYLES.author}>Anthony Byledbal</span>
      </div>
      <div className={STYLES["image-container"]}>
        <Image
          src={`/images/books/kiwis-dig-tunnels-too.jpg`}
          alt={t("bookTitle")}
          width={400}
          height={515}
          className={STYLES.image}
          priority={true}
          placeholder="empty"
        />
      </div>
      <p className={STYLES.description}>{t("bookDescription")}</p>
      <div className={STYLES["button-wrapper"]}>
        <button
          onClick={() => router.push(`/kiwis-dig-tunnels-too/`)}
          className={STYLES["hero-link"]}
        >
          <div className={STYLES["hero-link-content"]}>
            <BookOpenBadge />
            <div>{t("bookButton")}</div>
          </div>
          <div className={STYLES.arrow}>&rarr;</div>
        </button>
      </div>
    </section>
  );
}

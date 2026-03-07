// import Image from "next/image";
import Link from "next/link";

import STYLES from "./Resources.module.scss";

export function Resources() {
  return (
    <section
      id="resources"
      className={STYLES.container}
      aria-labelledby="resources-title"
    >
      <h2 id="resources-title">Resources to Explore</h2>
      <div className={STYLES.actions}>
        <Link href="/books/kiwis-dig-tunnels-too" className={STYLES.card}>
          <div className={STYLES["card-content"]}>
            <div className={STYLES["card-header"]}>
              <h3 className={STYLES.title}>Kiwis Dig Tunnels Too</h3>
              <div className={STYLES.badge}>Book</div>
            </div>
            <p className={STYLES.description}>
              Recruited for their digging skills, James Williamson, Harold
              Howard, George Race, and Gerald Punch—four New Zealand
              volunteers—are preparing to cross the oceans with their special
              unit to take part in this secret war. But on the other side of the
              world, this deadly game is already tipping in favor of the German
              miners.
            </p>
          </div>
          <div className={STYLES["button-base"]}>
            <div>
              <span className={STYLES.by}>By </span>
              <span className={STYLES.author}>Anthony Byledbal</span>
            </div>
            <div className={STYLES.arrow}>&rarr;</div>
          </div>
        </Link>
        <Link
          href="/books/les-kiwis-aussi-creusent-des-tunnels"
          className={STYLES.card}
        >
          <div className={STYLES["card-content"]}>
            <div className={STYLES["card-header"]}>
              <h3 className={STYLES.title}>
                Les Kiwis aussi creusent des tunnels
              </h3>
              <div className={STYLES.badge}>Livre</div>
            </div>
            <p className={STYLES.description}>
              Recrutés pour leurs aptitudes à creuser, James Williamson, Harold
              Howard, George Race et Gerald Punch, quatre engagés volontaires
              néo-zélandais, s&apos;apprêtent à traverser les océans avec leur
              unité spéciale pour prendre part à cette guerre secrète. Mais, de
              l&apos;autre côté de la terre, ce jeu mortel est déjà à
              l&apos;avantage des mineurs allemands.
            </p>
          </div>
          <div className={STYLES["button-base"]}>
            <div>
              <span className={STYLES.by}>Par </span>
              <span className={STYLES.author}>Anthony Byledbal</span>
            </div>
            <div className={STYLES.arrow}>&rarr;</div>
          </div>
        </Link>
      </div>
    </section>
  );
}

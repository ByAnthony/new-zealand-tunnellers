// import Image from "next/image";
import Link from "next/link";

import STYLES from "./Resources.module.scss";

type Props = {
  title: string;
  badge: string;
  description: string;
  locale: string;
};

function Resource({ title, badge, description, locale }: Props) {
  return (
    <Link
      href={
        locale === "fr"
          ? "/books/les-kiwis-aussi-creusent-des-tunnels"
          : "/books/kiwis-dig-tunnels-too"
      }
      className={STYLES.card}
    >
      <div className={STYLES["card-content"]}>
        <div className={STYLES["card-header"]}>
          <h3 className={STYLES.title}>{title}</h3>
          <div className={STYLES.badge}>{badge}</div>
        </div>
        <p className={STYLES.description}>{description}</p>
      </div>
      <div className={STYLES["button-base"]}>
        <div>
          <span className={STYLES.by}>{locale === "fr" ? "Par " : "By "}</span>
          <span className={STYLES.author}>Anthony Byledbal</span>
        </div>
        <div className={STYLES.arrow}>&rarr;</div>
      </div>
    </Link>
  );
}

export function Resources() {
  return (
    <section
      id="resources"
      className={STYLES.container}
      aria-labelledby="resources-title"
    >
      <h2 id="resources-title">Resources to Explore</h2>
      <div className={STYLES.actions}>
        <Resource
          title="Kiwis Dig Tunnels Too"
          badge="Book"
          description="Recruited for their digging skills, James Williamson, Harold
              Howard, George Race, and Gerald Punch—four New Zealand
              volunteers—are preparing to cross the oceans with their special
              unit to take part in this secret war. But on the other side of the
              world, this deadly game is already tipping in favor of the German
              miners."
          locale="en"
        />
        <Resource
          title="Les Kiwis aussi creusent des tunnels"
          badge="Livre"
          description="Recrutés pour leurs aptitudes à creuser, James Williamson, Harold
              Howard, George Race et Gerald Punch, quatre engagés volontaires
              néo-zélandais, s'apprêtent à traverser les océans avec leur
              unité spéciale pour prendre part à cette guerre secrète. Mais, de
              l'autre côté de la terre, ce jeu mortel est déjà à
              l'avantage des mineurs allemands."
          locale="fr"
        />
      </div>
    </section>
  );
}

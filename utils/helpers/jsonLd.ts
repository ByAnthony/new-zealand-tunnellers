import { BASE_URL } from "@/utils/helpers/metadata";

export const jsonLdAuthor = {
  "@type": "Person",
  name: "Anthony Byledbal",
} as const;

export const jsonLdPublisher = {
  "@type": "Organization",
  name: "New Zealand Tunnellers",
  url: BASE_URL,
} as const;

type TunnellerJsonLdInput = {
  awmm?: string;
  birthDate?: string;
  birthPlace?: string;
  deathCountry?: string;
  deathDate?: string;
  deathTown?: string;
  familyName: string;
  givenName: string;
  image?: string;
  jobTitle: string;
  url: string;
};

export const buildTunnellerJsonLd = ({
  awmm,
  birthDate,
  birthPlace,
  deathCountry,
  deathDate,
  deathTown,
  familyName,
  givenName,
  image,
  jobTitle,
  url,
}: TunnellerJsonLdInput) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: `${givenName} ${familyName}`,
  givenName,
  familyName,
  jobTitle,
  memberOf: {
    "@type": "Organization",
    name: "New Zealand Tunnelling Company",
  },
  url,
  ...(image && {
    image: `${BASE_URL}/images/roll/tunnellers/${image}`,
  }),
  ...(birthDate && { birthDate }),
  ...(birthPlace && {
    birthPlace: { "@type": "Place", addressCountry: birthPlace },
  }),
  ...(deathDate && { deathDate }),
  ...((deathTown || deathCountry) && {
    deathPlace: {
      "@type": "Place",
      ...(deathTown && { name: deathTown }),
      ...(deathCountry && { addressCountry: deathCountry }),
    },
  }),
  ...(awmm && { sameAs: awmm }),
});

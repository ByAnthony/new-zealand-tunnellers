export type FilterOption = {
  id: number | null;
  label: string;
};

// Database extract
export type TunnellerData = {
  id: number;
  slug: string;
  forename: string;
  surname: string;
  birthYear: string | null;
  deathYear: string | null;
  detachment: Detachment;
  detachment_en: string | null;
  detachment_id: number | null;
  rank: Rank;
  rank_en: string | null;
  rank_id: number | null;
  attached_corps: string | null;
  corps_en: string | null;
  corps_id: number | null;
  residence: string | null;
  residence_latitude: string | null;
  residence_longitude: string | null;
};

// Shaped data
export type Name = {
  forename: string;
  surname: string;
};

type Search = {
  fullName: string;
};

export type ResidenceOrigin = {
  town: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type Rank = string;

export type Detachment = string;

export type Tunneller = {
  id: number;
  slug: string;
  name: Name;
  birthYear: string | null;
  deathYear: string | null;
  detachment: Detachment;
  detachmentEn: string | null;
  detachmentId: number | null;
  rank: Rank;
  rankEn: string | null;
  rankId: number | null;
  search: Search;
  attachedCorps: string | null;
  corpsEn: string | null;
  corpsId: number | null;
  origin: {
    residence: ResidenceOrigin;
  };
};

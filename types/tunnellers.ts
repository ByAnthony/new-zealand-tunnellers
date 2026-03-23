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
  detachment_id: number | null;
  rank: Rank;
  rank_id: number | null;
  attached_corps: string | null;
  corps_id: number | null;
};

// Shaped data
export type Name = {
  forename: string;
  surname: string;
};

type Search = {
  fullName: string;
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
  detachmentId: number | null;
  rank: Rank;
  rankId: number | null;
  search: Search;
  attachedCorps: string | null;
  corpsId: number | null;
};

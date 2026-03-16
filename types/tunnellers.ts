// Database extract
export type TunnellerData = {
  id: number;
  forename: string;
  surname: string;
  birthYear: string | null;
  deathYear: string | null;
  detachment: Detachment;
  rank: Rank;
  attached_corps: string | null;
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
  name: Name;
  birthYear: string | null;
  deathYear: string | null;
  detachment: Detachment;
  rank: Rank;
  search: Search;
  attachedCorps: string | null;
};

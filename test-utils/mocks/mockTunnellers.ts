import { Tunneller } from "@/types/tunnellers";

const mockTunneller1: Tunneller = {
  id: 1,
  slug: "test-tunneller--1_234",
  name: { forename: "John", surname: "Doe" },
  birthYear: "1886",
  deathYear: "1952",
  search: { fullName: "John Doe" },
  detachment: "Main Body",
  detachmentEn: "Main Body",
  detachmentId: 1,
  rank: "Sapper",
  rankEn: "Sapper",
  rankId: 1,
  attachedCorps: null,
  corpsEn: null,
  corpsId: null,
  origin: {
    residence: {
      town: "Auckland",
      latitude: -36.8485,
      longitude: 174.7633,
    },
  },
};

const mockTunneller2: Tunneller = {
  id: 2,
  slug: "test-tunneller--1_234",
  name: { forename: "Biff", surname: "Tanen" },
  birthYear: "1897",
  deathYear: null,
  search: { fullName: "Biff Tanen" },
  detachment: "2nd Reinforcements",
  detachmentEn: "2nd Reinforcements",
  detachmentId: 2,
  rank: "Sapper",
  rankEn: "Sapper",
  rankId: 1,
  attachedCorps: null,
  corpsEn: null,
  corpsId: null,
  origin: {
    residence: {
      town: "Waihi",
      latitude: -37.3919,
      longitude: 175.8406,
    },
  },
};

const mockTunneller3: Tunneller = {
  id: 3,
  slug: "test-tunneller--1_234",
  name: { forename: "Emmett", surname: "Brown" },
  birthYear: null,
  deathYear: "1935",
  search: { fullName: "Emmett Brown" },
  detachment: "Main Body",
  detachmentEn: "Main Body",
  detachmentId: 1,
  rank: "Sapper",
  rankEn: "Sapper",
  rankId: 1,
  attachedCorps: null,
  corpsEn: null,
  corpsId: null,
  origin: {
    residence: {
      town: "Auckland",
      latitude: -36.8485,
      longitude: 174.7633,
    },
  },
};

const mockTunneller4: Tunneller = {
  id: 4,
  slug: "test-tunneller--1_234",
  name: { forename: "Marty", surname: "McFly" },
  birthYear: null,
  deathYear: null,
  search: { fullName: "Marty McFly" },
  detachment: "5th Reinforcements",
  detachmentEn: "5th Reinforcements",
  detachmentId: 5,
  rank: "Driver",
  rankEn: "Driver",
  rankId: 2,
  attachedCorps: "Army Pay Corps",
  corpsEn: "Army Pay Corps",
  corpsId: 3,
  origin: {
    residence: {
      town: null,
      latitude: null,
      longitude: null,
    },
  },
};

export const mockTunnellersData: Tunneller[] = [
  mockTunneller3,
  mockTunneller1,
  mockTunneller4,
  mockTunneller2,
];

export const mockTunnellers: Record<string, Tunneller[]> = {
  B: [mockTunneller3],
  D: [mockTunneller1],
  M: [mockTunneller4],
  T: [mockTunneller2],
};

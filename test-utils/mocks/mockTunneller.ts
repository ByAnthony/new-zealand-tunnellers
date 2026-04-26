import {
  ArmyExperience,
  Birth,
  Cemetery,
  DateObj,
  Death,
  DeathCause,
  DeathPlace,
  Demobilization,
  EmbarkationUnit,
  Employment,
  EndOfService,
  Enlistment,
  ImageArchives,
  ImageBook,
  ImageNewspaper,
  ImageSource,
  ImageTunneller,
  LondonGazette,
  Medal,
  MilitaryYears,
  NominalRoll,
  NzArchives,
  Origins,
  Parents,
  PreWayYears,
  Sources,
  Summary,
  Training,
  Transport,
  TunnellerProfile,
} from "@/types/tunneller";

import { mockFrontEvents } from "./mockFrontEvents";

// Summary
export const mockSummary: Summary = {
  serial: "4/2601",
  name: { forename: "John", surname: "Smith" },
  birth: "1886",
  death: "1966",
};

// Origins
export const mockBirth: Birth = {
  date: {
    year: "1886",
    dayMonth: "18 December",
  },
  country: "New Zealand",
};

export const mockParents: Parents = {
  mother: {
    name: "Jane Doe",
    origin: "New Zealand",
  },
  father: {
    name: "John Doe",
    origin: "Scotland",
  },
};

const mockOrigins: Origins = {
  birth: mockBirth,
  parents: mockParents,
  inNzLength: null,
};

// PreWarYears
export const mockArmyExperience: ArmyExperience = {
  unit: "NZ Infantry",
  country: "New Zealand",
  conflict: null,
  duration: "12 months",
};

export const mockArmyExperienceList: ArmyExperience[] = [mockArmyExperience];

export const mockEmployment: Employment = {
  occupation: "Goldminer",
  employer: "Goldmining Company",
};

const mockPreWarYears: PreWayYears = {
  armyExperience: mockArmyExperienceList,
  employment: mockEmployment,
  residence: null,
  maritalStatus: null,
  wife: null,
};

// MilitaryYears
export const mockBritishWarMedal: Medal = {
  name: "British War Medal",
  country: "United Kingdom",
  country_key: "United Kingdom",
  image: "british-war-medal.png",
  citation: null,
};

export const mockVictoryMedal: Medal = {
  name: "Victory Medal",
  country: "United Kingdom",
  country_key: "United Kingdom",
  image: "victory-medal.png",
  citation: null,
};

export const mockMedals: Medal[] = [mockBritishWarMedal, mockVictoryMedal];

export const mockDate: DateObj = {
  year: "1926",
  dayMonth: "13 October",
};

const mockPlace: DeathPlace = {
  location: "Telegraph Hill",
  town: "Arras",
  country: "France",
};

const mockCause: DeathCause = {
  cause: "Killed in action",
  circumstances: "Dead wounded by shell fire",
};

const mockCemetery: Cemetery = {
  name: "Faubourg d'Amiens",
  location: "Arras",
  country: "France",
  grave: "IE 18",
};

export const mockEnlistment: Enlistment = {
  serial: "1/1000",
  rank: "Sapper",
  date: mockDate,
  district: "Canterbury",
  alias: null,
  transferredToTunnellers: null,
  ageAtEnlistment: null,
};

const mockTraining: Training = {
  date: mockDate,
  location: "Auckland",
  locationType: "Military Camp",
};

export const mockEmbarkationUnit: EmbarkationUnit = {
  detachment: "Main Body",
  training: mockTraining,
  section: "Section No.2",
  attachedCorps: null,
};

export const mockTransport: Transport = {
  reference: "HMNZT 56",
  vessel: "Beata",
  departureDate: mockDate,
};

const mockDemobilization: Demobilization = {
  date: mockDate,
  country: "New Zealand",
};

export const mockEndOfService: EndOfService = {
  deserter: false,
  transferred: null,
  deathWar: false,
  transportNz: mockTransport,
  demobilization: mockDemobilization,
};

export const mockMilitaryYears: MilitaryYears = {
  enlistment: mockEnlistment,
  embarkationUnit: mockEmbarkationUnit,
  transportUk: mockTransport,
  frontEvents: mockFrontEvents,
  endOfService: mockEndOfService,
  medals: mockMedals,
};

// Death
export const mockDeath: Death = {
  warInjuriesDeathAfterWar: false,
  date: mockDate,
  place: mockPlace,
  cause: mockCause,
  cemetery: mockCemetery,
  ageAtDeath: 89,
};

// Sources
const mockNzArchives: NzArchives[] = [
  {
    reference: "AABK 18805 W5530 39/0022386",
    url: "https://www.mockurl.co.nz/nzarchives/B2874930",
  },
];

const mockAwmmCenotaph: string =
  "https://www.mockurl.co.nz/online-cenotaph/B2874930";

const mockNominalRoll: NominalRoll = {
  title:
    "Nominal Roll of New Zealand Expeditionary Force, 1915. New Zealand Engineers Tunnelling Company",
  town: "Wellington",
  publisher: "Government Printer",
  date: "1916",
  page: "37",
  volume: null,
  roll: null,
};

const mockLondonGazette: LondonGazette[] = [
  {
    page: "1675",
    date: "23 May 1917",
  },
];

export const mockSources: Sources = {
  nzArchives: mockNzArchives,
  awmmCenotaph: mockAwmmCenotaph,
  nominalRoll: mockNominalRoll,
  londonGazette: mockLondonGazette,
};

// Image
export const mockImageAucklandLibraries: string =
  "https://digitalnz.org/records?text=31-B2671&tab=Images#";

export const mockImageArchives: ImageArchives = {
  location: "Auckland War Memorial Museum",
  reference: "MS-93/157",
};

export const mockImageFamily: string = "John Doe";

export const mockImageNewspaper: ImageNewspaper = {
  name: "Auckland Star",
  date: "12 July 1898",
};

export const mockImageBook: ImageBook = {
  title: "My Mock Title",
  town: "Bethune",
  publisher: "Publisher and Co.",
  authors: [
    {
      forename: "Jane",
      surname: "Doe",
    },
  ],
  year: "1925",
  page: "p. 89",
};

export const mockImageSource: ImageSource = {
  aucklandLibraries: mockImageAucklandLibraries,
  archives: null,
  family: null,
  newspaper: null,
  book: null,
};

export const mockImageTunneller: ImageTunneller = {
  url: "1/1234.jpg",
  source: mockImageSource,
};

// Profile
export const mockTunnellerProfile: TunnellerProfile = {
  id: 1,
  slug: "harry-corrin--4_1415",
  summary: mockSummary,
  origins: mockOrigins,
  preWarYears: mockPreWarYears,
  militaryYears: mockMilitaryYears,
  death: mockDeath,
  sources: mockSources,
  image: mockImageTunneller,
};

import { Detachment, Name } from "./tunnellers";

// Database extract
export type ProfileData = {
  id: number;
  surname: string;
  forename: string;
  birth_date: string | null;
  death_date: string | null;
  birth_country: string | null;
  mother_name: string | null;
  mother_origin: string | null;
  father_name: string | null;
  father_origin: string | null;
  nz_resident_in_month: number | null;
  enlistment_date: string | null;
  posted_date: string | null;
  occupation: string | null;
  employer: string | null;
  residence: string | null;
  marital_status: string | null;
  wife_name: string | null;
  serial: string;
  rank: string;
  district: string | null;
  aka: string | null;
  posted_from_corps: string | null;
  embarkation_unit: Detachment;
  training_start: string;
  training_location: string;
  training_location_type: string;
  section: string | null;
  attached_corps: string | null;
  transport_uk_ref: string;
  transport_uk_vessel: string;
  transport_uk_start: string;
  has_deserted: number | null;
  transferred_to_date: string | null;
  transferred_to_unit: string | null;
  death_type: string | null;
  transport_nz_ref: string | null;
  transport_nz_vessel: string | null;
  transport_nz_start: string | null;
  demobilization_date: string | null;
  discharge_uk: number | null;
  death_location: string | null;
  death_town: string | null;
  death_country: string | null;
  death_cause: string | null;
  death_circumstances: string | null;
  cemetery: string | null;
  cemetery_town: string | null;
  cemetery_country: string | null;
  grave: string | null;
  awmm_cenotaph: string | null;
  nominal_roll_volume: string | null;
  nominal_roll_number: string | null;
  nominal_roll_page: string;
  image: string | null;
  image_source_auckland_libraries: string | null;
  archives_name: string | null;
  archives_ref: string | null;
  family_name: string | null;
  newspaper_name: string | null;
  newspaper_date: string | null;
  book_title: string | null;
  book_town: string | null;
  book_publisher: string | null;
  book_year: string | null;
  book_page: string | null;
};

export type DeathData = {
  deathType: string | null;
  deathDate: string | null;
  deathLocation: string | null;
  deathTown: string | null;
  deathCountry: string | null;
  deathCause: string | null;
  deathCircumstances: string | null;
  cemetery: string | null;
  cemteryTown: string | null;
  cemeteryCountry: string | null;
  grave: string | null;
};

export type SingleEventData = {
  date: string;
  event: string;
  title: string | null;
  titleKey?: string | null;
  image: string | null;
  imageAlt?: string | null;
  extraDescription?: string | null;
};

export type EventData = {
  date: DateObj;
  event: string;
  title: string;
  image: string | null;
  imageAlt?: string | null;
  extraDescription?: string | null;
};

export type JoinEventData = {
  date: string | null;
  trainingStart: string;
  trainingLocation: string;
  embarkationUnit: string;
  isEnlisted: boolean;
};

// Shaped data
export type DateObj = {
  year: string;
  dayMonth: string;
};

export type Summary = {
  serial: string;
  name: Name;
  birth: string | null;
  death: string | null;
};

export type Birth = {
  date: DateObj | null;
  country: string | null;
};

export type Parent = {
  name: string;
  origin: string | null;
};

export type Parents = {
  mother: Parent | null;
  father: Parent | null;
};

export type Origins = {
  birth: Birth;
  parents: Parents;
  inNzLength: string | null;
};

export type ArmyExperience = {
  unit: string;
  country: string | null;
  conflict: string | null;
  duration: string | null;
};

export type Employment = {
  occupation: string | null;
  employer: string | null;
};

export type PreWayYears = {
  armyExperience: ArmyExperience[];
  employment: Employment;
  residence: string | null;
  maritalStatus: string | null;
  wife: string | null;
};

export type Transferred = {
  date: DateObj | null;
  unit: string | null;
};

export type Enlistment = {
  serial: string;
  rank: string;
  date: DateObj | null;
  district: string | null;
  alias: string | null;
  transferredToTunnellers: Transferred | null;
  ageAtEnlistment: number | null;
};

export type Training = {
  date: DateObj | null;
  location: string;
  locationType: string;
};

export type EmbarkationUnit = {
  detachment: Detachment;
  training: Training;
  section: string | null;
  attachedCorps: string | null;
};

export type Transport = {
  reference: string | null;
  vessel: string;
  departureDate: DateObj;
};

export type EventDetail = {
  description: string;
  title: string | null;
  titleKey?: string | null;
  image: string | null;
  imageAlt?: string | null;
  extraDescription?: string | null;
};

export type Event = {
  date: DateObj;
  event: EventDetail[];
};

export type TransferredTo = {
  date: DateObj | null;
  unit: string;
};

export type Medal = {
  name: string;
  country: string;
  image: string;
  citation: string | null;
};

export type Demobilization = {
  date: DateObj;
  country: string | null;
};

export type EndOfService = {
  deserter: boolean;
  transferred: TransferredTo | null;
  deathWar: boolean;
  transportNz: Transport | null;
  demobilization: Demobilization | null;
};

export type MilitaryYears = {
  enlistment: Enlistment;
  embarkationUnit: EmbarkationUnit;
  transportUk: Transport | null;
  frontEvents: Record<string, Event[]>;
  endOfService: EndOfService;
  medals: Medal[];
};

export type DeathPlace = {
  location: string | null;
  town: string | null;
  country: string | null;
};

export type DeathCause = {
  cause: string | null;
  circumstances: string | null;
};

export type Cemetery = {
  name: string | null;
  location: string | null;
  country: string | null;
  grave: string | null;
};

export type Death = {
  warInjuriesDeathAfterWar: boolean;
  date: DateObj | null;
  place: DeathPlace | null;
  cause: DeathCause | null;
  cemetery: Cemetery | null;
  ageAtDeath: number | null;
};

export type NzArchives = {
  reference: string;
  url: string;
};

export type Book = {
  title: string;
  town: string;
  publisher: string;
};

export type NominalRoll = Book & {
  date: string;
  page: string;
  volume?: string | null;
  roll?: string | null;
};

export type LondonGazette = {
  page: string;
  date: string;
};

export type Sources = {
  nzArchives: NzArchives[];
  awmmCenotaph: string | null;
  nominalRoll: NominalRoll;
  londonGazette: LondonGazette[];
};

export type ImageArchives = {
  location: string | null;
  reference: string | null;
};

export type ImageNewspaper = {
  name: string | null;
  date: string | null;
};

export type Author = {
  forename: string;
  surname: string;
};

export type ImageBook = {
  authors: Author[] | null;
  title: string | null;
  town: string | null;
  publisher: string | null;
  year: string | null;
  page: string | null;
};

export type ImageSource = {
  aucklandLibraries: string | null;
  archives: ImageArchives | null;
  family: string | null;
  newspaper: ImageNewspaper | null;
  book: ImageBook | null;
};

export type ImageTunneller = {
  url: string;
  source: ImageSource;
};

export type TunnellerProfile = {
  id: number;
  summary: Summary;
  origins: Origins;
  preWarYears: PreWayYears;
  militaryYears: MilitaryYears;
  death: Death | null;
  sources: Sources;
  image: ImageTunneller | null;
};

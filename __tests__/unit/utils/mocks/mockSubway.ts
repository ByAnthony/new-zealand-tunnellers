import { SubwayData } from "@/utils/database/queries/subwaysQuery";

export const mockSubway: SubwayData = {
  subway_id: 2,
  subway_name_en: "Sewer-Glasgow",
  subway_name_fr: "Égout-Glasgow",
  subway_type_en: "Subway done by 184th Tunnelling Company",
  subway_type_fr: "Souterrain réalisé par la 184ᵉ Compagnie de tunneliers",
  subway_date_start: "1916-11-28",
  subway_date_end: "1917-01-22",
  subway_latitude: 50.287814,
  subway_longitude: 2.784128,
  subway_note_en: null,
  subway_note_fr: null,
};

export const mockSubwayNoDate: SubwayData = {
  ...mockSubway,
  subway_id: 1,
  subway_name_en: "Sewer",
  subway_name_fr: "Égout",
  subway_type_en: "Subway",
  subway_type_fr: "Souterrain",
  subway_date_start: null,
  subway_date_end: null,
};

export const mockSubwaySingleDate: SubwayData = {
  ...mockSubway,
  subway_id: 3,
  subway_date_end: "1916-11-28",
};

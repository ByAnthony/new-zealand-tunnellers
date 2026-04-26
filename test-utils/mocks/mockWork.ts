import { WorkData } from "@/utils/database/queries/worksQuery";

export const mockWork: WorkData = {
  work_id: 1,
  work_name: "Corona Cave",
  work_type_en: null,
  work_type_fr: null,
  work_category_1_en: "Dugout",
  work_category_1_fr: "Abri souterrain",
  work_category_2_en: null,
  work_category_2_fr: null,
  work_section: 2,
  work_date_start: "1917-06-15",
  work_date_end: "1917-07-15",
  work_latitude: 50.305,
  work_longitude: 2.876,
};

export const mockWorkTwoCategories: WorkData = {
  ...mockWork,
  work_id: 2,
  work_name: "M.G. Dugout Cross Roads",
  work_type_en: null,
  work_type_fr: null,
  work_category_1_en: "Machine-gun nest",
  work_category_1_fr: "Nid de mitrailleuse",
  work_category_2_en: "Dugout",
  work_category_2_fr: "Abri souterrain",
};

export const mockWorkWithType: WorkData = {
  ...mockWork,
  work_id: 3,
  work_name: "Feuchy Road",
  work_type_en: "Anti-aircraft battery",
  work_type_fr: "Batterie anti-aérienne",
  work_category_1_en: "Dugout",
  work_category_1_fr: "Abri souterrain",
};

export const mockWorkSingleDate: WorkData = {
  ...mockWork,
  work_id: 4,
  work_name: "New Street",
  work_date_start: "1917-07-18",
  work_date_end: "1917-07-18",
};

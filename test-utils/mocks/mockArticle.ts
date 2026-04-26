import { Chapter, ImageArticle, Next, Section } from "@/types/article";

export const mockTitle: string = "My Awesome\\Article Title";

export const mockChapter: number = 1;

export const mockTopImage: ImageArticle = {
  file: "img-123.png",
  title: null,
  photographer: null,
  reference: null,
  alt: "Accessible alt text",
};

export const mockArticleImage: ImageArticle = {
  ...mockTopImage,
  title: "An Amazing Photo",
  photographer: "The French Photographer Doisneau",
  reference: "Where the photo is preserved",
};

export const mockSectionOne: Section = {
  title: "Section Title 1",
  text: "Section text one",
};

export const mockSectionTwo: Section = {
  title: "Section Title 2",
  text: "Section text two",
};

export const mockSectionThree: Section = {
  title: "Section Title 3",
  text: "Section text three",
};

export const mockNextButton: Next = {
  url: "my-path-to-next-chapter/",
  title: "Next\\Chapter",
  chapter: 3,
};

export const mockNotes: string =
  "[1.](#reference_1) Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\\n\\n[2.](#reference_2) Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export const mockArticle: Chapter = {
  id: "my-awesome-article",
  chapter: mockChapter,
  title: mockTitle,
  section: [mockSectionOne, mockSectionTwo],
  image: [mockTopImage, mockArticleImage],
  next: mockNextButton,
  notes: mockNotes,
};

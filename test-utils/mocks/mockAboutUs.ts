import {
  mockSectionOne,
  mockSectionTwo,
  mockSectionThree,
  mockTitle,
  mockTopImage,
} from "@/test-utils/mocks/mockArticle";
import { AboutUsArticle } from "@/types/article";

export const mockAboutUs: AboutUsArticle = {
  id: "my-awesome-article",
  title: mockTitle,
  section: [mockSectionOne, mockSectionTwo, mockSectionThree],
  image: [mockTopImage],
};

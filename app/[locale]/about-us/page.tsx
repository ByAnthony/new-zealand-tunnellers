import type { Metadata } from "next";
import { NextResponse } from "next/server";

import { AboutUs } from "@/components/AboutUs/AboutUs";
import {
  AboutUsData,
  SectionData,
  AboutUsArticle,
  ImageData,
} from "@/types/article";
import { mysqlConnection } from "@/utils/database/mysqlConnection";
import {
  aboutUsTitle,
  aboutUsSections,
  aboutUsImage,
} from "@/utils/database/queries/aboutUsQuery";

async function getData() {
  const connection = await mysqlConnection.getConnection();

  try {
    const data: AboutUsData = await aboutUsTitle(connection);
    const sections: SectionData[] = await aboutUsSections(connection);
    const images: ImageData[] = await aboutUsImage(connection);

    const article: AboutUsArticle = {
      id: data.id,
      title: data.title,
      section: sections,
      image: images,
    };

    return NextResponse.json(article);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch About Us data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export const metadata: Metadata = {
  title: "About Us - New Zealand Tunnellers",
};

export default async function Page() {
  const response = await getData();
  const article: AboutUsArticle = await response.json();

  return <AboutUs article={article} />;
}

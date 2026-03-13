import { Metadata } from "next";
import { NextResponse } from "next/server";

import { Roll } from "@/components/Roll/Roll";
import { Tunneller } from "@/types/tunnellers";
import { getTunnellers } from "@/utils/database/getTunnellers";
import { mysqlConnection } from "@/utils/database/mysqlConnection";

async function getData() {
  const connection = await mysqlConnection.getConnection();

  try {
    const response = await getTunnellers(connection);
    const data = await response.json();

    const tunnellers: Record<string, Tunneller[]> = data.reduce(
      (acc: Record<string, Tunneller[]>, tunneller: Tunneller) => {
        const firstLetter: string = tunneller.name.surname
          .charAt(0)
          .toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push({
          ...tunneller,
        });
        return acc;
      },
      {} as { [key: string]: Tunneller[] },
    );

    return NextResponse.json(tunnellers);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Tunnellers data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export const metadata: Metadata = {
  title: "List of Tunnellers - New Zealand Tunnellers",
};

export default async function Page() {
  const response = await getData();
  const tunnellers: Record<string, Tunneller[]> = await response.json();

  return <Roll tunnellers={tunnellers} />;
}

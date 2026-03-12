import { Timeline } from "@/components/Timeline/Timeline";
import { TunnellerProfile } from "@/types/tunneller";
import { getTunneller } from "@/utils/database/getTunneller";
import { mysqlConnection } from "@/utils/database/mysqlConnection";

type Props = {
  params: Promise<{ id: string }>;
};

async function getData(id: string) {
  const connection = await mysqlConnection.getConnection();

  try {
    return getTunneller(id, connection);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch Timeline data: ${errorMessage}`);
  } finally {
    connection.release();
  }
}

export async function generateMetadata(props: Props) {
  const { id } = await props.params;
  const response = await getData(id);
  const tunneller: TunnellerProfile = await response.json();

  const surname = tunneller.summary.name.surname;
  const forename = tunneller.summary.name.forename;

  return {
    title: `Timeline of ${forename} ${surname} - New Zealand Tunnellers`,
  };
}

export default async function Page(props: Props) {
  const { id } = await props.params;
  const response = await getData(id);
  const tunneller: TunnellerProfile = await response.json();

  return <Timeline tunneller={tunneller} />;
}

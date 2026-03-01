import { Metadata } from "next";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";

export const metadata: Metadata = {
  title: "Les Kiwis aussi creusent des tunnels - New Zealand Tunnellers",
};

export default async function Page() {
  return <ContentsContainer locale="fr" />;
}

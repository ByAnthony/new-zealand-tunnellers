import { Metadata } from "next";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";

export const metadata: Metadata = {
  title: "Kiwis Dig Tunnels Too - New Zealand Tunnellers",
};

export default async function Page() {
  return <ContentsContainer locale="en" />;
}

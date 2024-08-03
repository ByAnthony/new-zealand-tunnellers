import type { Metadata } from "next";
import { ReactNode } from "react";

import { Footer } from "@/components/Footer/Footer";
import { MenuContainer } from "@/components/Menu/MenuContainer";
import Transition from "@/components/Transition/Transition";

import "./globals.scss";

export const metadata: Metadata = {
  title: "New Zealand Tunnellers",
  description:
    "Discover the history of the New Zealand Tunnellers from the formation of their company to the underground warfare during the First World War",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MenuContainer />
        <Transition>
          {children}
          <Footer />
        </Transition>
      </body>
    </html>
  );
}

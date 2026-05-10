import { notFound } from "next/navigation";

import NotFound from "../not-found";

export default function Page() {
  if (process.env.NODE_ENV === "development") {
    return <NotFound />;
  }

  notFound();
}

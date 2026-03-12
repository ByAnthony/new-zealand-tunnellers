import { ReactNode } from "react";

// Root layout — intentionally minimal.
// The [locale] nested layout provides the full <html>/<body> structure.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

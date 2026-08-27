"use client";

import { usePathname } from "next/navigation";

import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const isAdmin =
    pathname.startsWith(
      "/admin"
    );

  if (isAdmin) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        flexDirection:
          "column",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}
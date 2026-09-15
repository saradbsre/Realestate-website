"use client";

import React from "react";
import {
  usePathname,
} from "next/navigation";

import InternalAccessGuard
  from "./InternalAccessGuard";

import Navbar
  from "./Header";

import Footer
  from "./Footer";


interface SiteShellProps {
  children:
    React.ReactNode;
}


export default function SiteShell({
  children,
}: SiteShellProps) {
  const pathname =
    usePathname();

  const isLoginPage =
    pathname ===
    "/login";


  /* =====================================================
     LOGIN PAGE
     No header / footer
  ===================================================== */

  if (
    isLoginPage
  ) {
    return (
      <InternalAccessGuard>
        {children}
      </InternalAccessGuard>
    );
  }


  /* =====================================================
     NORMAL WEBSITE
  ===================================================== */

  return (
    <InternalAccessGuard>
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
        <Navbar />

        <main
          style={{
            flex: 1,
          }}
        >
          {children}
        </main>

        <Footer />
      </div>
    </InternalAccessGuard>
  );
}
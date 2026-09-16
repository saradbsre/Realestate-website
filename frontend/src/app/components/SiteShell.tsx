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


  /* =====================================================
     PAGE CHECKS
  ===================================================== */

  const isLoginPage =
    pathname ===
    "/login";

  const isAdminPage =
    pathname ===
      "/admin" ||
    pathname.startsWith(
      "/admin/"
    );


  /* =====================================================
     LOGIN PAGE
     No Navbar
     No Footer
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
     ADMIN PORTAL
     Keep website Navbar
     Remove website Footer
  ===================================================== */

  if (
    isAdminPage
  ) {
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
        </div>
      </InternalAccessGuard>
    );
  }


  /* =====================================================
     NORMAL WEBSITE
     Navbar + Content + Footer
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
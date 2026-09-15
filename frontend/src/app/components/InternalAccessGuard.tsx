"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";


interface InternalAccessGuardProps {
  children:
    React.ReactNode;
}


export default function InternalAccessGuard({
  children,
}: InternalAccessGuardProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    ready,
    setReady,
  ] =
    useState(false);


  useEffect(() => {
    if (
      pathname ===
      "/login"
    ) {
      setReady(true);

      return;
    }

    const hasAccess =
      localStorage.getItem(
        "internal_site_access"
      ) ===
      "allowed";

    if (
      !hasAccess
    ) {
      router.replace(
        "/login"
      );

      return;
    }

    setReady(true);
  }, [
    pathname,
    router,
  ]);


  if (
    !ready
  ) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#f7f9fb",

          color:
            "#36506a",

          fontSize:
            "14px",

          fontWeight:
            700,
        }}
      >
        Checking access...
      </div>
    );
  }


  return (
    <>
      {children}
    </>
  );
}
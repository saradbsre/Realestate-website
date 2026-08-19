"use client";

import { useEffect } from "react";

const BACKEND_URL =
 process.env.NEXT_PUBLIC_API_URL || "";

export default function KeepBackendAlive() {
  useEffect(() => {
    if (!BACKEND_URL) {
      return;
    }

    const pingBackend = async () => {
      try {
        await fetch(
          `${BACKEND_URL}/api/health`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
      } catch (error) {
        console.error(
          "Backend health check failed:",
          error
        );
      }
    };

    // Call immediately
    pingBackend();

    // Render sleeps after 15 min,
    // so call every 10 minutes.
    const interval = setInterval(
      pingBackend,
      10 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return null;
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ABDULWAHED BIN SHABIB REAL ESTATE L.L.C | Premium Direct Rentals",
  description: "Direct property owners in the UAE since 1981. We own, lease, and manage an exclusive portfolio of residential apartments, villas, and commercial spaces.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

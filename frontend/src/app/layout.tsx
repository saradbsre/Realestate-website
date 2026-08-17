import type { Metadata } from "next";

import "./globals.css";

import Header from "./components/Header";
import KeepBackendAlive from "./components/KeepBackendAlive";

export const metadata: Metadata = {
  title: "Abdulwahed Bin Shabib Real Estate",
  description:
    "Residential and commercial properties for rent in the UAE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <KeepBackendAlive />
        <Header />

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
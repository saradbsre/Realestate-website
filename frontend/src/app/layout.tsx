import type {
  Metadata,
} from "next";

import "./globals.css";

import SiteShell
  from "./components/SiteShell";


export const metadata:
  Metadata = {
  title:
    "Abdulwahed Ahmad Rashed Bin Shabib Real Estate",

  description:
    "Residential and commercial properties for rent in UAE",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
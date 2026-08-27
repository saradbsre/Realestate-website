import type {
  Metadata,
} from "next";

import "./globals.css";

import SiteChrome from "./components/SiteChrome";

export const metadata:
  Metadata = {
  title:
    "Abdulwahed Bin Shabib Real Estate",

  description:
    "Abdulwahed Bin Shabib Real Estate",
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
        <SiteChrome>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
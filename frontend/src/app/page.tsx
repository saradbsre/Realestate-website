import HomeClient from "./HomeClient";

import {
  getProperties,
  type Property,
} from "@/lib/propertyApi";

export default async function Home() {
  let serializedProperties:
    Property[] = [];

  try {
    const result =
      await getProperties({
        page: 1,
        pageSize: 10,
      });

    serializedProperties =
      result.properties;
  } catch (error) {
    console.error(
      "Failed to fetch initial properties from API:",
      error
    );
  }

  return (
    <HomeClient
      initialProperties={
        serializedProperties
      }
    />
  );
}
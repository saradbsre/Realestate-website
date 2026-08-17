import HomeClient from "./HomeClient";
import { getProperties, type Property } from "@/lib/propertyApi";

// Force Next.js to dynamically fetch data on each request to reflect manual creations & ERP syncs instantly
export const revalidate = 0;

export default async function Home() {
  const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let serializedProperties: Property[] = [];

  try {
    ({ properties: serializedProperties } = await getProperties({ pageSize: 10 }, backendUrl));
  } catch (error) {
    console.error("Failed to fetch initial properties from API:", error);
  }

  return <HomeClient initialProperties={serializedProperties} />;
}

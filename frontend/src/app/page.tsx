import HomeClient from "./HomeClient";

// Force Next.js to dynamically fetch data on each request to reflect manual creations & ERP syncs instantly
export const revalidate = 0;

export default async function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let serializedProperties = [];

  try {
    const res = await fetch(`${backendUrl}/api/properties`, { cache: "no-store" });
    if (res.ok) {
      serializedProperties = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch initial properties from API:", error);
  }

  return <HomeClient initialProperties={serializedProperties} />;
}

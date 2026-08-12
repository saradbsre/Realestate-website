import { notFound } from "next/navigation";
import PropertyClient from "./PropertyClient";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const propertyId = parseInt(id, 10);
  
  if (isNaN(propertyId)) {
    notFound();
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let serializedProperty = null;

  try {
    const res = await fetch(`${backendUrl}/api/properties/${propertyId}`, { cache: "no-store" });
    if (res.ok) {
      serializedProperty = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch property details from API:", error);
  }

  if (!serializedProperty) {
    notFound();
  }

  return <PropertyClient property={serializedProperty} />;
}

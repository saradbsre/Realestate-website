"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import Hero from "./components/Hero";
import FeaturedListings from "./components/FeaturedListings";
import UpcomingProjects from "./components/UpcomingProjects";
import WhyChooseUs from "./components/WhyChooseUs";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import Header from "./components/Header";

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  purpose: string;
  status: string;
  beds: number;
  baths: number;
  area: number;
  images: string;
  erpId: string | null;
}

interface HomeClientProps {
  initialProperties: Property[];
}

export default function HomeClient({ initialProperties }: HomeClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);

  const handleSearch = async (filters: {
    purpose: string;
    location: string;
    status: string;
    type: string;
    beds: string;
    minPrice: string;
    maxPrice: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters.purpose) params.append("purpose", filters.purpose);
      if (filters.location) params.append("location", filters.location);
      if (filters.status) params.append("status", filters.status);
      if (filters.type) params.append("type", filters.type);
      if (filters.beds) params.append("beds", filters.beds);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to filter properties");
      const data = await res.json();
      setProperties(data);

      document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}
      <Header />

      {/* Main Sections */}
      <main>
        {/* Interactive Search Hero Banner */}
        <Hero onSearch={handleSearch} />

        {/* Quick About section to round out the layout */}
        <section id="about" className={`section-container ${styles.aboutSection}`}>
          <div className={styles.aboutHeading}>
            <h2>About ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</h2>
            <div className={styles.aboutHeadingAccent}></div>
          </div>
          <div className={styles.aboutContent}>
            <div className={styles.aboutCopy}>
              <h3>
                Legacy of Luxury Real Estate in UAE
              </h3>
              <p>
                ABDULWAHED BIN SHABIB REAL ESTATE L.L.C represents a prestigious legacy of direct property ownership and comprehensive asset management across the UAE. Unlike standard brokers, we are the direct owners and landlords of all properties listed on our portal, guaranteeing transparent lease terms, direct owner negotiations, and high-standard maintenance support. We own and manage prime residential and commercial buildings across Deira, Sheikh Zayed Road, Sharjah, Umm Al Quwain, and major master plan communities.
              </p>
              <p>
                We specialize in premium direct rentals, providing our clients with access to our exclusive range of apartments, penthouses, villas, and commercial facilities. Whether you are looking for a long-term home or business space in most sought-after locations, our professional management team is dedicated to finding the perfect property from our owned portfolio.
              </p>
            </div>
            <div className={styles.aboutImage}>
              <img
                src="/luxury_villa_hero.jpg"
                alt="About us"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        {/* Grid Listings */}
        <FeaturedListings properties={properties} />

        {/* Browse New Projects in UAE */}
        <UpcomingProjects />

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* FAQ Homepage Section */}
        <FaqSection />
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}

"use client";

import React, {
  useEffect,
  useState,
} from "react";
import styles from "./home.module.css";

import Hero from "./components/Hero";
import FeaturedListings from "./components/FeaturedListings";
import UpcomingProjects from "./components/UpcomingProjects";
import WhyChooseUs from "./components/WhyChooseUs";
import FaqSection from "./components/FaqSection";


import {
  getProperties,
  type Property,
} from "@/lib/propertyApi";

interface HomeClientProps {
  initialProperties: Property[];
}

interface HeroSearchFilters {
  location: string;

  unitTypeId: number | null;

  beds: string;

  minPrice: string;

  maxPrice: string;
}

export default function HomeClient({
  initialProperties,
}: HomeClientProps) {
  const [properties, setProperties] =
    useState<Property[]>(
      initialProperties
    );

  const [searching, setSearching] =
    useState(false);
useEffect(() => {
  const loadInitialProperties = async () => {
    try {
      console.log("HOME: loading initial properties");

      const { properties: results } =
        await getProperties({
          page: 1,
          pageSize: 10,
        });

      console.log(
        "HOME: API properties:",
        results
      );

      setProperties(results || []);
    } catch (error) {
      console.error(
        "HOME: initial load error:",
        error
      );
    }
  };

  loadInitialProperties();
}, []);
  const handleSearch = async (
    filters: HeroSearchFilters
  ) => {
    try {
      setSearching(true);

      const {
        properties: results,
      } = await getProperties({
        /*
         * Location search
         */
        search:
          filters.location.trim() ||
          undefined,

        /*
         * Property Type
         *
         * Apartment = UnitTypeId 1
         * Office = UnitTypeId 3
         * etc.
         */
        unitTypeId:
          filters.unitTypeId ??
          undefined,

        /*
         * Actual ERP Purpose_type code:
         *
         * STD
         * 1BK
         * 2BK
         * 3BK
         * 4BK
         *
         * Don't send "All".
         */
        beds:
          filters.beds !== "All"
            ? filters.beds
            : undefined,

        /*
         * Annual rent
         */
        minPrice:
          filters.minPrice ||
          undefined,

        maxPrice:
          filters.maxPrice ||
          undefined,

        /*
         * Home page only shows
         * first 10 buildings.
         */
        page: 1,

        pageSize: 10,
      });

      setProperties(
        results
      );

      requestAnimationFrame(() => {
        document
          .getElementById(
            "listings"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    } catch (error) {
      console.error(
        "Search error:",
        error
      );
    } finally {
      setSearching(false);
    }
  };

  

  return (
    <div
      style={{
        backgroundColor:
          "#ffffff",

        minHeight:
          "100vh",
      }}
    >


      <main>
        {/* HERO */}
        <Hero
          onSearch={
            handleSearch
          }
        />

        {/* ABOUT */}
        <section
          id="about"
          className={`section-container ${styles.aboutSection}`}
        >
          <div
            className={
              styles.aboutHeading
            }
          >
            <h2>
              About ABDULWAHED
              BIN SHABIB REAL
              ESTATE L.L.C
            </h2>

            <div
              className={
                styles.aboutHeadingAccent
              }
            />
          </div>

          <div
            className={
              styles.aboutContent
            }
          >
            <div
              className={
                styles.aboutCopy
              }
            >
              <h3>
                Legacy of Luxury
                Real Estate in UAE
              </h3>

              <p>
                ABDULWAHED BIN
                SHABIB REAL ESTATE
                L.L.C represents a
                prestigious legacy
                of direct property
                ownership and
                comprehensive asset
                management across
                the UAE. Unlike
                standard brokers,
                we are the direct
                owners and
                landlords of all
                properties listed
                on our portal,
                guaranteeing
                transparent lease
                terms, direct owner
                negotiations, and
                high-standard
                maintenance
                support. We own
                and manage prime
                residential and
                commercial
                buildings across
                Deira, Sheikh
                Zayed Road,
                Sharjah, Umm Al
                Quwain, and major
                master plan
                communities.
              </p>

              <p>
                We specialize in
                premium direct
                rentals, providing
                our clients with
                access to our
                exclusive range of
                apartments,
                penthouses,
                villas, and
                commercial
                facilities.
                Whether you are
                looking for a
                long-term home or
                business space in
                most sought-after
                locations, our
                professional
                management team is
                dedicated to
                finding the
                perfect property
                from our owned
                portfolio.
              </p>
            </div>

            <div
              className={
                styles.aboutImage
              }
            >
              <img
                src="/luxury_villa_hero.jpg"
                alt="About us"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit:
                    "cover",
                }}
              />
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <FeaturedListings
          properties={
            properties
          }
        />

        <UpcomingProjects />

        <WhyChooseUs />

        <FaqSection />
      </main>


    </div>
  );
}
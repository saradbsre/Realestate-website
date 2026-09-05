"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

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
  initialProperties:
    Property[];
}


interface HeroSearchFilters {
  location: string;

  unitTypeId:
    number | null;

  beds: string;

  minPrice: string;

  maxPrice: string;

  minArea?: string;

  maxArea?: string;
}


export default function HomeClient({
  initialProperties,
}: HomeClientProps) {
  const router =
    useRouter();


  const [
    properties,
    setProperties,
  ] =
    useState<Property[]>(
      initialProperties
    );


  const [
    searching,
    setSearching,
  ] =
    useState(false);


  /* =========================================================
     LOAD FEATURED PROPERTIES
  ========================================================= */

  useEffect(() => {
    const loadInitialProperties =
      async () => {
        try {
          const {
            properties:
              results,
          } =
            await getProperties({
              page: 1,
              pageSize: 6,
               view:
      "building",
            });


          setProperties(
            results ||
              []
          );
        } catch (
          error
        ) {
          console.error(
            "HOME: initial load error:",
            error
          );
        }
      };


    loadInitialProperties();
  }, []);


  /* =========================================================
     SEARCH
     Navigate to All Properties page
  ========================================================= */

  const handleSearch =
    async (
      filters:
        HeroSearchFilters
    ) => {
      try {
        setSearching(
          true
        );


        const params =
          new URLSearchParams();


        /* LOCATION */

        const location =
          filters.location.trim();

        if (
          location
        ) {
          params.set(
            "search",
            location
          );
        }


        /* PROPERTY TYPE */

        if (
          filters.unitTypeId !==
            null &&
          filters.unitTypeId !==
            undefined
        ) {
          params.set(
            "unitTypeId",
            String(
              filters.unitTypeId
            )
          );
        }


        /* BEDROOM */

        if (
          filters.beds &&
          filters.beds !==
            "All"
        ) {
          params.set(
            "beds",
            filters.beds
          );
        }


        /* PRICE */

        if (
          filters.minPrice
        ) {
          params.set(
            "minPrice",
            filters.minPrice
          );
        }


        if (
          filters.maxPrice
        ) {
          params.set(
            "maxPrice",
            filters.maxPrice
          );
        }


        /* UNIT AREA */

        if (
          filters.minArea
        ) {
          params.set(
            "minArea",
            filters.minArea
          );
        }


        if (
          filters.maxArea
        ) {
          params.set(
            "maxArea",
            filters.maxArea
          );
        }


        /* ALWAYS START FROM PAGE 1 */

        params.set(
          "page",
          "1"
        );


        const query =
          params.toString();


        router.push(
          query
            ? `/properties?${query}`
            : "/properties"
        );
      } catch (
        error
      ) {
        console.error(
          "Search navigation error:",
          error
        );
      } finally {
        setSearching(
          false
        );
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
                  width:
                    "100%",

                  height:
                    "100%",

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
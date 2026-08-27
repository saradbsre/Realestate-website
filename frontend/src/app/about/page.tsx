"use client";

import React from "react";
import Link from "next/link";
import styles from "./about.module.css";
import navStyles from "../home.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function AboutPage() {
  const dubaiLocations = [
    "Deira", "Bur Dubai", "Al Jaddaf", "Al Qusais", "Al Barsha South 2", 
    "Hor Al Anz", "Al Karama", "Umm Ramool", "Warsan", "Al Warqa", 
    "Sheikh Zayed Road", "Al Quoz", "Al Qudra Third", "Al Barari", 
    "Al Hamriya 1", "Ras Al Khor", "Jebel Ali"
  ];

  const otherEmirates = ["Sharjah", "Umm Al Quwain"];

  const residentialTypes = ["Apartments", "Villas", "Family-friendly residential communities"];

  const commercialTypes = [
    "Shops & Retail Spaces", "Offices & Business Centers", 
    "Warehouses & Industrial Units", "Cold Storage Facilities", 
    "Staff & Labour Accommodation", "Commercial Villas"
  ];

  const brokerPillars = [
    {
      title: "Flexible Payment Options",
      text: "Our experience of 25 years building and making achievements in the world of development.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      title: "Competitive price",
      text: "The prices we offer you are very competitive without reducing the quality of the company's work.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    },
    {
      title: "On Time",
      text: "Our dedication to listing on time guarantees for residents, businesses, and partners trust and confidence in every interaction.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      title: "Exceptional Service",
      text: "From attentive property management and maintenance to concierge-style assistance and tailored solutions.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}
 

      {/* Page Title & Breadcrumbs */}
      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumbContent}>
          <h1 className={styles.breadcrumbTitle}>About Us</h1>
          <div className={styles.breadcrumbPath}>
            <Link href="/">Home</Link> &gt; About Us
          </div>
        </div>
      </div>

      {/* Slogan + Paragraphs Grid */}
      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <div className={styles.introGrid}>
            <h2 className={styles.sloganText}>
              Building Trust. Creating Long-Term Value.
            </h2>
            <div>
              <p className={styles.paragraphText}>
                Founded in 1981, Abdulwahed Bin Shabib Investment L.L.C. is a well-established and diversified UAE-based organization with a strong presence across Real Estate, Retail, Healthcare, Restaurants, and Government Services. With over four decades of experience, the Group has built a reputation for reliability, adaptability, and delivering value-driven solutions to the communities it serves.
              </p>
              <p className={styles.paragraphText}>
                Recognizing the long-term potential of the UAE's property market, the Group expanded into the real estate sector in the late 1990s. Since then, Abdulwahed Bin Shabib has played an active role in developing and managing landmark commercial and residential properties, including well-known developments such as the 2020 Building on Sheikh Zayed Road, Bin Shabib Mall, and commercial buildings in Jebel Ali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Banner with Blue Overlaid Card */}
      <section className={styles.portfolioSection}>
        <div className={styles.portfolioContent}>
          <div className={styles.bannerWrapper}>
            <img
              src="/portfolio_building.jpg"
              alt="A Diverse Real Estate Portfolio Across the UAE"
              className={styles.bannerImage}
            />
            <div className={styles.bannerCard}>
              <h3>A Diverse Real Estate Portfolio Across the UAE</h3>
              <p>
                Today, our real estate portfolio spans Dubai, Sharjah, and Umm Al Quwain, offering long-term rental units designed to meet the evolving needs of residents, businesses, and investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Geographic Coverage Block (Badges list) */}
      <section className={styles.coverageSection}>
        <div className={styles.coverageContent}>
          <div className={styles.coverageGrid}>
            
            {/* Dubai locations col */}
            <div className={styles.coverageCol}>
              <h3 className={styles.coverageTitle}>Dubai:</h3>
              <div className={styles.badgeGrid}>
                {dubaiLocations.map((loc, i) => (
                  <span key={i} className={styles.badge}>{loc}</span>
                ))}
              </div>
            </div>

            {/* Other Emirates col */}
            <div className={styles.coverageCol}>
              <h3 className={styles.coverageTitle}>Other Emirates:</h3>
              <div className={styles.badgeGrid}>
                {otherEmirates.map((em, i) => (
                  <span key={i} className={styles.badge}>{em}</span>
                ))}
              </div>
            </div>

            {/* Residential Properties col */}
            <div className={styles.coverageCol}>
              <h3 className={styles.coverageTitle}>Residential Properties:</h3>
              <ul className={styles.bulletList}>
                {residentialTypes.map((type, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot}></span>
                    {type}
                  </li>
                ))}
              </ul>
            </div>

            {/* Commercial Properties col */}
            <div className={styles.coverageCol}>
              <h3 className={styles.coverageTitle}>Commercial Properties:</h3>
              <ul className={styles.bulletList}>
                {commercialTypes.map((type, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot}></span>
                    {type}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us as Broker */}
      <section className={styles.whyChooseSection}>
        <div className={styles.whyChooseContent}>
          <div className={styles.whyChooseHeader}>
            <h3>Why Choose Abdul Wahed Bin Shabib Real Estate L.L.C</h3>
            <p>We provide full-service support at every step of your property journey.</p>
          </div>

          <div className={styles.whyChooseGrid}>
            {brokerPillars.map((pillar, i) => (
              <div key={i} className={styles.whyChooseCard}>
                <div className={styles.whyChooseIcon}>{pillar.icon}</div>
                <h4>{pillar.title}</h4>
                <p>{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Real Estate Agent CTA Bar */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h3 className={styles.ctaTitle}>Become a Real Estate Agent</h3>
          <p className={styles.ctaText}>
            Let's talk to us, share your dream project and we will transform it into reality.
          </p>
          <a
            href="https://wa.me/97142545888?text=Hello%20Abdul%20Wahed%20Bin%20Shabib%20Real%20Estate%20team,%20I%20would%20like%20to%20register%20as%20an%20agent"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Register Now
          </a>
        </div>
      </section>

   
    </div>
  );
}

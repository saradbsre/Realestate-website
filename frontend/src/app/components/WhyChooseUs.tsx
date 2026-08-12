"use client";

import React from "react";
import styles from "./whyChooseUs.module.css";

export default function WhyChooseUs() {
  const cards = [
    {
      title: "Flexible Payment Plans",
      text: "We understand that flexibility matters. That's why we offer payment options in multiple cheques, making it easier for tenants to manage their finances comfortably and plan long-term with confidence.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      title: "Free Pre-Move-In Maintenance",
      text: "Every tenant deserves a well-prepared space. We provide free maintenance before move-in, ensuring the property is in proper working condition so you can settle in without unnecessary delays or concerns.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      title: "Dedicated Maintenance",
      text: "Our in-house maintenance teams and dedicated call center are focused solely on tenant support. From routine requests to urgent issues, our teams respond promptly and professionally to keep your space functioning smoothly.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      )
    },
    {
      title: "Local Branches for Faster Assistance",
      text: "To serve our tenants better, we operate dedicated branches across key locations, allowing quicker response times and personalized support.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      title: "Long-Term Leasing You Can Rely On",
      text: "We specialize in long-term residential and commercial rentals, offering stability, transparency, and professionally managed properties that support both comfortable living and sustainable business growth.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    },
    {
      title: "Trusted Since 1981",
      text: "With over four decades of experience, our reputation is built on consistency, responsibility, and strong tenant relationships, making us a trusted choice across Dubai, Sharjah, and Umm Al Quwain.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41L12 2z" />
          <path d="M5 5h.01" />
        </svg>
      )
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Left Column: Heading + Image */}
          <div className={styles.leftCol}>
            <div className={styles.sectionTitle}>Why Choose Us</div>
            <h2 className={styles.sectionSub}>Your Trusted Real Estate Partner In Dubai</h2>
            <p className={styles.introText}>
              We provide reliable property solutions with a focus on transparency, expertise, and customer satisfaction.
            </p>
            <div className={styles.imageWrapper}>
              <img
                src="/why-choose-us.webp"
                alt="Trusted Real Estate Partner"
                className={styles.image}
              />
            </div>
          </div>

          {/* Right Column: 6 Cards Grid */}
          <div className={styles.rightCol}>
            {cards.map((card, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.iconCircle}>{card.icon}</div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

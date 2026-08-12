"use client";

import React from "react";
import styles from "./brandSection.module.css";

export default function BrandSection() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        {/* Marsa Al Saadiyat styled brand logo */}
        <div className={styles.logoArea}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c5a880"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <div className={styles.marsaLogo}>
            <span className={styles.marsaTop}>Marsa</span>
            <span className={styles.marsaMain}>AL SAADIYAT</span>
          </div>
        </div>

        {/* Learn More Action Button */}
        <button
          type="button"
          onClick={() => {
            document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
          }}
          className={styles.learnMoreBtn}
        >
          Learn More
        </button>

        {/* ALDAR styled brand logo */}
        <div className={styles.logoArea}>
          <div className={styles.aldarLogo}>
            <div className={styles.aldarSymbol}>A</div>
            <span className={styles.aldarText}>Aldar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

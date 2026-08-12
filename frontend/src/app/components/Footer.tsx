"use client";

import React from "react";
import Link from "next/link";
import styles from "../home.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        
        {/* Column 1: Logo (top) & Description (below) */}
        <div className={styles.footerCol}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#ffffff", padding: "8px", borderRadius: "8px", display: "inline-block", width: "110px" }}>
              <img
                src="/bin-shabib-group.webp"
                alt="AWS Real Estate Logo"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <p style={{ color: "#a3a3a3", fontSize: "13px", lineHeight: "1.6", margin: 0, maxWidth: "280px" }}>
              ABDULWAHED BIN SHABIB REAL ESTATE L.L.C is a pioneering name in the UAE property market, delivering excellence and innovation for over 30 years as direct owners.
            </p>
          </div>
        </div>

        {/* Column 2: Company */}
        <div className={styles.footerCol}>
          <h3>Company</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/#listings">Residential</Link></li>
            <li><Link href="/#listings">Commercial</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className={styles.footerCol}>
          <h3>Support</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/contact">Help Centre</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Column 4: Location & Phones */}
        <div className={styles.footerCol}>
          <h3>Location</h3>
          <p style={{ fontSize: "13px", color: "#a3a3a3", lineHeight: "1.6", marginBottom: "12px" }}>
            🏢 Street # 44A - Hor Al Anz - Deira - Dubai, UAE
          </p>
          <p style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.6", fontWeight: "600" }}>
            📞 Tollfree: <a href="tel:80022773" style={{ color: "#f58220", textDecoration: "none" }}>800 22773</a>
          </p>
          <p style={{ fontSize: "13px", color: "#ffffff", lineHeight: "1.6", fontWeight: "600" }}>
            📞 Landline: <a href="tel:043298000" style={{ color: "#f58220", textDecoration: "none" }}>04 329 8000</a>
          </p>
        </div>

        {/* Column 5: Office Timing */}
        <div className={styles.footerCol}>
          <h3>Office Timing</h3>
          <p style={{ fontSize: "13px", color: "#ffffff", fontWeight: "700", lineHeight: "1.6" }}>
            ⏰ 9:30 AM to 7:30 PM
          </p>
          <p style={{ fontSize: "12px", color: "#a3a3a3", marginBottom: "8px" }}>
            (Monday - Saturday)
          </p>
          <p style={{ fontSize: "13px", color: "#ef4444", fontWeight: "700", lineHeight: "1.6" }}>
            🚪 Sunday: Closed
          </p>
        </div>

      </div>

      {/* Blue Bottom Ribbon Copyright Strip */}
      <div className={styles.copyright}>
        <div className={styles.copyrightLinks}>
          <Link href="/privacy" className={styles.copyrightLink}>Privacy Policy</Link>
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px" }}>|</span>
          <Link href="/terms" className={styles.copyrightLink}>Terms & Conditions</Link>
        </div>
        <p>AWS REAL ESTATE @ {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
}

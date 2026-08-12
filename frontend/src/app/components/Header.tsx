"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../home.module.css";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Top Double-Sticky Slim Ribbon */}
      <div className={styles.ribbon}>
        {/* Left Side Contact Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="tel:043298000" className={styles.ribbonLink}>📞 Landline: 04 329 8000</a>
          <span className={styles.ribbonDivider}>|</span>
          <a href="tel:80022773" className={styles.ribbonLink}>📞 Tollfree: 800 22773</a>
          <span className={styles.ribbonDivider}>|</span>
          <a href="mailto:info@abdulwahedbinshabibproperty.com" className={styles.ribbonLink}>
            📧 info@abdulwahedbinshabibproperty.com
          </a>
        </div>
        
        {/* Right Side Links */}
        <div>
          <Link href="/contact" className={styles.ribbonLink}>Contact us</Link>
        </div>
      </div>

      {/* Main Solid White Sticky Navigation Header */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand} onClick={closeMenu}>
          <img
            src="/bin-shabib-group.webp"
            alt="ABDULWAHED BIN SHABIB REAL ESTATE L.L.C"
            className={styles.logoImage}
          />
        </Link>
        <button
          type="button"
          className={styles.menuToggle}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          id="primary-navigation"
          className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ""}`}
        >
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`${styles.navLink} ${pathname === "/about" ? styles.navLinkActive : ""}`}
            onClick={closeMenu}
          >
            About us
          </Link>
          <Link href="/#listings" className={styles.navLink} onClick={closeMenu}>Residential</Link>
          <Link href="/#listings" className={styles.navLink} onClick={closeMenu}>Commercial</Link>
          <Link 
            href="/contact" 
            className={`${styles.navLink} ${pathname === "/contact" ? styles.navLinkActive : ""}`}
            onClick={closeMenu}
          >
            Register Your Interest
          </Link>
          <Link href="/contact" className={`${styles.navLink} ${styles.mobileOnlyLink}`} onClick={closeMenu}>
            Contact Us
          </Link>
          <Link href="/admin" className={styles.navBtn} onClick={closeMenu}>Admin Portal</Link>
        </div>
      </nav>
    </>
  );
}

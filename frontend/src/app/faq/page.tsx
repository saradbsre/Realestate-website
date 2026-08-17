"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./faq.module.css";
import navStyles from "../home.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function FaqPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is the process for renting a residential property in Dubai?",
      a: "Renting a residential property in Dubai involves choosing the property, making a formal offer, signing a tenancy contract (Ejari), paying the refundable security deposit (typically 5% of annual rent for unfurnished and 10% for furnished), and submitting post-dated cheques to cover the rental installments."
    },
    {
      q: "How much is the rent and security deposit?",
      a: "Rents are determined by market rates and community location. Rent is traditionally paid in 1 to 4 cheques per year. The security deposit is normally 5% of the annual rent value for unfurnished units, and 10% for fully furnished residences. This deposit is fully refundable at the end of the tenancy upon handover of the property in clean and good working order."
    },
    {
      q: "What about maintenance and regulations?",
      a: "Major maintenance works (structural faults, main electrical line repairs, plumbing blockages, and major AC replacement) are legally the responsibility of the landlord. Minor maintenance (e.g. replacing bulbs, repairing kitchen cabinet locks, and fixing leaks under AED 500) is handled by the tenant. All tenancy contracts must be registered under the Dubai Land Department Ejari system to be legally binding."
    },
    {
      q: "What is the process for renting a commercial property in Dubai?",
      a: "Renting a commercial property requires a valid trade license matching the zoning activity permitted within the building (e.g., offices, shops, or warehouses). The tenant signs a commercial tenancy contract, registers it under Ejari, and pays the security deposit (usually 10% of the annual rent). Any internal fit-out and layout plans must be approved by the Dubai Municipality and building developer."
    },
    {
      q: "What is the lease duration and deposit?",
      a: "Commercial leases are standardly signed on a 1-year renewable basis, although multi-year agreements (3 to 5 years) are very common to support corporate fit-outs and business planning. The security deposit is typically 10% of the annual rent and is refundable upon lease termination and returning the premises to its original handover condition."
    },
    {
      q: "Who handles maintenance, and is subleasing allowed?",
      a: "Maintenance responsibilities are specified in detail within the commercial lease terms. Generally, internal workspace maintenance, fit-outs, and operational servicing are the tenant's responsibility. Subleasing is strictly prohibited in the UAE unless explicit written permission is obtained from the landlord and registered accordingly."
    }
  ];

  const toggleAccordion = (idx: number) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}
  

      {/* Breadcrumbs Container */}
      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumbContent}>
          <h1 className={styles.breadcrumbTitle}>Faqs</h1>
          <div className={styles.breadcrumbPath}>
            <Link href="/">Home</Link> &gt; Frequently Asked Questions
          </div>
        </div>
      </div>

      {/* Accordion List Container */}
      <main className={styles.container}>
        <div className={styles.headerSection}>
          <h2>Frequently Asked Questions</h2>
          <p>Get clear and quick answers to the most common queries regarding residential and commercial renting in Dubai.</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => {
            const isOpen = activeIdx === i;
            return (
              <div key={i} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                <button onClick={() => toggleAccordion(i)} className={styles.faqHeader}>
                  <span className={styles.question}>{faq.q}</span>
                  <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}>➔</span>
                </button>
                <div className={`${styles.faqContent} ${isOpen ? styles.faqContentOpen : ""}`}>
                  <p className={styles.answer}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className={styles.supportCard}>
          <h3>Still Have Questions?</h3>
          <p>If you couldn't find the answers you were looking for, please contact our support team directly.</p>
          <Link href="/contact" className={styles.supportBtn}>
            Get in Touch
          </Link>
        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}

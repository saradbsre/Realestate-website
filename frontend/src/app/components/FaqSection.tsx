"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./faqSection.module.css";

export default function FaqSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is the process for renting a residential property in Dubai?",
      a: "The process begins with choosing a property and submitting an offer. Once agreed, a tenancy contract is drawn and registered via Ejari. Rent is typically paid in 1-4 post-dated cheques."
    },
    {
      q: "How much is the rent and security deposit?",
      a: "Rents are based on current market valuations in Dubai. Unfurnished residential leases require a refundable 5% security deposit, while furnished properties require a 10% deposit."
    },
    {
      q: "What about maintenance and regulations?",
      a: "All tenancy agreements must be registered in the government Ejari system. Landlords are responsible for structural, electrical, and major AC repairs, while tenants handle minor upkeep."
    },
    {
      q: "What is the process for renting a commercial property in Dubai?",
      a: "Tenants must possess a valid trade license matching the zoning activity. A lease contract is signed and registered under Ejari, and fit-outs are completed according to building codes."
    },
    {
      q: "What is the lease duration and deposit?",
      a: "Commercial leases are typically signed on a 1-year renewable basis, though multi-year terms are common. Security deposits are usually equivalent to 10% of the annual lease value."
    },
    {
      q: "Who handles maintenance, and is subleasing allowed?",
      a: "Internal fit-out upkeep is handled by the commercial tenant. Subleasing is strictly illegal under Dubai real estate laws unless express written consent is provided by the landlord."
    }
  ];

  const toggleAccordion = (idx: number) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.layout}>
          
          {/* Left Column: Accordion Titles */}
          <div className={styles.accordionList}>
            {faqs.map((faq, i) => {
              const isOpen = activeIdx === i;
              return (
                <div key={i} className={`${styles.accordionItem} ${isOpen ? styles.accordionItemOpen : ""}`}>
                  <button onClick={() => toggleAccordion(i)} className={styles.accordionHeader}>
                    <span className={styles.questionText}>{faq.q}</span>
                    <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowIconOpen : ""}`}>
                      ➔
                    </span>
                  </button>
                  <div className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ""}`}>
                    <p className={styles.answerText}>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Text & Buttons */}
          <div className={styles.rightCol}>
            <div className={styles.sectionTag}>Frequently Ask Question</div>
            <h2 className={styles.sectionHeading}>Got Questions? We Have Answers</h2>
            <p className={styles.introText}>
              Find clear and quick solutions to all your queries. Our team is here to provide reliable information and helpful support whenever you need it.
            </p>
            <div className={styles.btnRow}>
              <Link href="/faq" className={styles.btnPrimary}>
                More FAQS
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                Ask Question
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

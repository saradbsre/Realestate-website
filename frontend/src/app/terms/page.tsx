"use client";

import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}
      <Header />

      {/* Breadcrumb Hero */}
      <div style={{ backgroundColor: "#0b1a30", padding: "60px 20px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: 0, letterSpacing: "0.5px" }}>Terms & Conditions</h1>
        <div style={{ marginTop: "12px", fontSize: "14px", color: "#94a3b8" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>&rarr;</span>
          <span style={{ color: "#ffffff" }}>Terms & Conditions</span>
        </div>
      </div>

      {/* Terms Body */}
      <main style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
          
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "30px" }}>
            <strong>Last Updated:</strong> August 8, 2026
          </p>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              Welcome to the portal of <strong>ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</strong> (referred to as "the Company," "we," "us," or "our"). By accessing or using this website (abdulwahedbinshabibproperty.com), you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, along with our Privacy Policy. If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              2. Scope of Services & Direct Ownership Model
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              ABDULWAHED BIN SHABIB REAL ESTATE L.L.C is the direct owner and landlord of all properties advertised on this website. 
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>We do not operate as an intermediary real estate brokerage for third-party properties.</li>
              <li style={{ marginBottom: "8px" }}>All leasing negotiations, tenancy contracts, and building management services are handled directly by our internal administration.</li>
              <li style={{ marginBottom: "8px" }}>This direct-to-owner model ensures transparent rental rates, official documentation, and straight-line maintenance support.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              3. Regulatory Compliance & Ejari Registration
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              All lease transactions are governed by the laws and regulations of the Emirate of Dubai and the federal laws of the United Arab Emirates.
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Ejari Registration:</strong> In accordance with Law No. 26 of 2007 (regulating relationships between landlords and tenants in Dubai), all tenancy contracts must be registered with the Ejari system. The Ejari registration fee is generally paid by the tenant unless otherwise agreed in writing.</li>
              <li style={{ marginBottom: "8px" }}><strong>Rental Disputes:</strong> Any disputes arising from tenancy will be referred to the Rental Dispute Settlement Centre (RDSC) of the Dubai Land Department.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              4. Security Deposits & Payments
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              Upon confirming a rental booking, specific financial terms apply:
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Security Deposit:</strong> A security deposit (traditionally 5% of annual rent for unfurnished units, and 10% for furnished units) must be paid to secure the property. This deposit is refundable upon termination of the lease, subject to the property being handed over in original condition, normal wear and tear excepted.</li>
              <li style={{ marginBottom: "8px" }}><strong>Cheques:</strong> All rental payments are made via post-dated cheques made payable to <strong>ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</strong>. Returned cheques will incur administrative penalties and legal remedies as per UAE laws.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              5. Accuracy of Listings & Disclaimers
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              While we make every effort to maintain real-time availability and accurate pricing across our commercial and residential portfolios, property statuses are subject to change. Layout dimensions, photos, and virtual tours are for illustrative and representative purposes only. Tenants are strongly advised to inspect the physical premises prior to signing tenancy documents.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              6. Intellectual Property
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              All materials, text, graphics, logos, images, code, and trademarks displayed on this site are the exclusive property of ABDULWAHED BIN SHABIB REAL ESTATE L.L.C and are protected by copyright and intellectual property laws of the UAE and international treaties. Unauthorized duplication, hotlinking, or reproduction is strictly prohibited.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              7. Governing Law & Jurisdiction
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              These Terms & Conditions are governed by and construed in accordance with the laws of the Emirate of Dubai and the federal laws of the United Arab Emirates. Any legal action or dispute arising from the use of this website shall be subject to the exclusive jurisdiction of the Courts of Dubai, UAE.
            </p>
          </section>

        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}

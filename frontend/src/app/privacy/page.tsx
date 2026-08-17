"use client";

import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}
    

      {/* Breadcrumb Hero */}
      <div style={{ backgroundColor: "#0b1a30", padding: "60px 20px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: 0, letterSpacing: "0.5px" }}>Privacy Policy</h1>
        <div style={{ marginTop: "12px", fontSize: "14px", color: "#94a3b8" }}>
          <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>&rarr;</span>
          <span style={{ color: "#ffffff" }}>Privacy Policy</span>
        </div>
      </div>

      {/* Privacy Body */}
      <main style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" }}>
          
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "30px" }}>
            <strong>Last Updated:</strong> August 9, 2026
          </p>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              1. Introduction
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              At <strong>ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</strong>, we value the privacy and security of our clients and website visitors. This Privacy Policy details how we collect, store, process, and protect your personal data when you interact with our portal (abdulwahedbinshabibproperty.com), submit contact forms, or register interest in our direct rental units.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              2. Compliance with UAE Data Laws
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              We govern our data collection practices in full alignment with the provisions of <strong>UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL)</strong>. We maintain robust administrative, physical, and digital safeguards to defend your personal information against unauthorized disclosure, alteration, or access.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              3. Information We Collect
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              When you submit enquiries or register interest for our buildings, we collect specific details:
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Contact Details:</strong> Your name, email address, phone number, and mailing address.</li>
              <li style={{ marginBottom: "8px" }}><strong>Transaction Records:</strong> Documents required for Ejari/tenancy registration, such as copies of your Emirates ID, Passport, and UAE Residence Visa.</li>
              <li style={{ marginBottom: "8px" }}><strong>Technical Info:</strong> Your IP address, browser type, and navigation cookies recorded to enhance your viewing experience.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              4. How We Use Your Data
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              All collected information is utilized solely for official business operations:
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>To draft, execute, and register official tenancy contracts (Ejari) directly in your name.</li>
              <li style={{ marginBottom: "8px" }}>To respond to your rental, commercial workspace, or apartment availability inquiries within 2 hours.</li>
              <li style={{ marginBottom: "8px" }}>To communicate maintenance schedules, payment reminders, or building notices.</li>
              <li style={{ marginBottom: "8px" }}>To fulfill mandatory compliance requests from the Dubai Land Department or other UAE regulatory bodies.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              5. Data Retention & Sharing Policy
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", marginBottom: "12px" }}>
              We strictly enforce a non-sharing policy:
            </p>
            <ul style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}><strong>No Third-Party Sales:</strong> We do NOT sell, lease, trade, or distribute your personal details to external marketing agencies or brokerages.</li>
              <li style={{ marginBottom: "8px" }}><strong>Legal Exceptions:</strong> We may share data with government, municipal, or judicial authorities if required by active UAE laws or DLD mandates.</li>
              <li style={{ marginBottom: "8px" }}><strong>Retention Period:</strong> We store lease documents and details for the mandatory duration required by Dubai tax and real estate law, after which it is securely destroyed or anonymized.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              6. Your Rights
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              Under UAE PDPL, you hold the right to access, correct, update, or request the deletion of your personal data records held by us, provided it does not conflict with active contractual obligations. To exercise these rights, please email us directly at <strong>info@abdulwahedbinshabibproperty.com</strong>.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#0b1a30", fontWeight: 700, marginBottom: "16px", borderBottom: "2px solid #f1f5f9", paddingBottom: "8px" }}>
              7. Security Safeguards
            </h2>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "15px" }}>
              All digital assets, form databases, and server pathways are encrypted using Secure Socket Layer (SSL) protocols. While we implement maximum industrial safeguards, please note that no method of internet transmission or database storage is 100% secure, and we cannot guarantee absolute data security against malicious cyber events.
            </p>
          </section>

        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}

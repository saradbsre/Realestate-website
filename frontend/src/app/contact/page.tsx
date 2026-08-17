"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./contact.module.css";
import navStyles from "../home.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const nationalityCodes = "AE AF AL DZ AR AU AT BD BE BH BR CA CH CN DE EG ES FR GB IN IQ IT JO KE KR KW LB LK MA MX MY NG NL NP OM PK PH QA RU SA SG TH TN TR UA US VN ZA".split(" ");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    subject: "General Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<any | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmittedDetails({ ...formData });
        setFormData({
          name: "",
          email: "",
          phone: "",
          nationality: "",
          subject: "General Inquiry",
          message: "",
        });
      } else {
        alert("Failed to submit inquiry. Please check details and try again.");
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Blue Ribbon */}
      {/* Unified Sticky Header */}
  

      {/* Hero Banner */}
      <header className={styles.hero}>
        <h1>Get in Touch</h1>
        <p>Whether you're looking to lease, rent, sell, or list your property assets, we are here to guide you.</p>
      </header>

      {/* Main Container */}
      <main className={styles.container}>
        <div className={styles.grid}>
          
          {/* Left Column: Contact details */}
          <div className={styles.contactInfo}>
            <h2>Office Contact Info</h2>
            <p className={styles.introText}>
              Visit our headquarters in Dubai or call us to speak with a neighborhood specialist directly. We look forward to partnering with you on your luxury real estate journey.
            </p>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>🏢</div>
                <div className={styles.infoDetails}>
                  <h4>Head Office</h4>
                  <p>Street # 44A - Hor Al Anz - Deira - Dubai, United Arab Emirates</p>
                  <p style={{ marginTop: "6px" }}>
                    <a 
                      href="https://www.google.com/maps/place/Abdulwahed+Bin+Shabib+Real+Estate+L.L.C/data=!4m2!3m1!1s0x0:0xf50635e0e33a8e1?sa=X&ved=1t:2428&ictx=111." 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: "#0f4c81", fontWeight: "600", fontSize: "13px", textDecoration: "underline" }}
                    >
                      View on Google Maps &rarr;
                    </a>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📞</div>
                <div className={styles.infoDetails}>
                  <h4>Telephone Support</h4>
                  <p>📞 Tollfree Support: <a href="tel:80022773" style={{ color: "#0f4c81", fontWeight: 700 }}>800 22773</a></p>
                  <p>📞 Direct Landline: <a href="tel:043298000" style={{ color: "#0f4c81", fontWeight: 700 }}>04 329 8000</a></p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>📧</div>
                <div className={styles.infoDetails}>
                  <h4>Email Support</h4>
                  <p>General Enquiries: <a href="mailto:info@abdulwahedbinshabibproperty.com" style={{ color: "#0f4c81", fontWeight: "600" }}>info@abdulwahedbinshabibproperty.com</a></p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>🕒</div>
                <div className={styles.infoDetails}>
                  <h4>Office Hours</h4>
                  <p>Monday - Saturday: 9:30 AM - 7:30 PM</p>
                  <p style={{ color: "#ef4444", fontWeight: 700 }}>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form or Success receipt */}
          <div className={styles.formCard}>
            {!submittedDetails ? (
              <>
                <h3>Send Us a Message</h3>
                <p>Fill out the form below and an advisor will contact you within 2 hours.</p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@address.com"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+971 50 123 4567"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nationality *</label>
                    <select name="nationality" value={formData.nationality} onChange={handleChange} required className={styles.input}>
                      <option value="">Select nationality</option>
                      {nationalityCodes.map((code) => <option key={code} value={countryNames.of(code) || code}>{countryNames.of(code) || code}</option>)}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Inquiry Department</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.input}
                    >
                      <option value="General Inquiry">General Property Inquiry</option>
                      <option value="Buying Luxury Asset">Buying Luxury Asset</option>
                      <option value="Renting / Leasing">Renting / Leasing</option>
                      <option value="ERP Developer Integration">ERP / API Developer Integration</option>
                      <option value="Listing my property">Listing my property</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      required
                      className={styles.textarea}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    {loading ? "Sending..." : "Submit Enquiry"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <h3 style={{ fontSize: "22px", color: "#1e3a8a", marginBottom: "8px" }}>Enquiry Received!</h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                  Dear <strong>{submittedDetails.name}</strong>, thank you for contacting ABDULWAHED BIN SHABIB REAL ESTATE L.L.C. We have received your inquiry.
                </p>

                <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "16px", textAlign: "left", fontSize: "13px", color: "#334155", marginBottom: "20px" }}>
                  <div style={{ marginBottom: "6px" }}><strong>Department:</strong> {submittedDetails.subject}</div>
                  <div style={{ marginBottom: "6px" }}><strong>Phone:</strong> {submittedDetails.phone}</div>
                  <div><strong>Message:</strong> "{submittedDetails.message}"</div>
                </div>

                <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#1e40af", marginBottom: "24px", lineHeight: "1.5" }}>
                  📧 A copy of this enquiry and a confirmation email has been dispatched to: <strong>{submittedDetails.email}</strong>
                </div>

                {/* WhatsApp Button for Urgent Inquiries */}
                <a
                  href={`https://wa.me/97143298000?text=Hello%20ABDULWAHED%20BIN%20SHABIB%20REAL%20ESTATE%20L.L.C%20team!%20I%20have%20submitted%20a%20website%20contact%20enquiry%20regarding%20${encodeURIComponent(submittedDetails.subject)}.%20My%20name%20is%20${encodeURIComponent(submittedDetails.name)}.%20My%20phone%20number%20is%20${encodeURIComponent(submittedDetails.phone)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    backgroundColor: "#25D366",
                    color: "#ffffff",
                    textDecoration: "none",
                    padding: "14px 20px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "16px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#128C7E")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                >
                  💬 Chat on WhatsApp (Urgent Inquiry)
                </a>

                <button
                  onClick={() => setSubmittedDetails(null)}
                  style={{
                    backgroundColor: "transparent",
                    color: "#64748b",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Send Another Enquiry
                </button>
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}

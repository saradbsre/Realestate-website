"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./property.module.css";
// import Footer from "../../components/Footer";
// import Header from "../../components/Header";
import type { Property } from "@/lib/propertyApi";
// import BookingModal from "../../components/BookingModal/BookingModal";

interface PropertyClientProps {
  property: Property;
}

export default function PropertyClient({ property }: PropertyClientProps) {
  let imagesList: string[] = [];
  try {
    imagesList = JSON.parse(property.images || "[]");
  } catch {}

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [enquiry, setEnquiry] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    message: `Hi, I am interested in "${property.title}" (Ref: ${
      property.erpId || `MANUAL-${property.id}`
    }). Please contact me.`,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<typeof enquiry | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [booking, setBooking] = useState({ name: "", email: "", phone: "", nationality: "", passport: null as File | null });
  const isTwinTower = property.erpId === "BAYUT-10220-mTLK8P";
  const amenities = [
    { label: "Centrally Air-Conditioned", icon: "❄️" },
    { label: "Gym or Health Club", icon: "🏋️" },
    { label: "Kids Play Area", icon: "🛝" },
    { label: "Waste Disposal", icon: "🗑️" },
    { label: "Maintenance Staff", icon: "🛠️" },
    { label: "CCTV Monitoring", icon: "📹" },
    { label: "Security Staff", icon: "🛡️" },
  ];
  const nationalityCodes = "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEnquiry((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          nationality: enquiry.nationality,
          subject: `Property Inquiry: ${property.title}`,
          message: enquiry.message
        })
      });
      if (res.ok) {
        setSubmittedDetails({ ...enquiry });
        setEnquiry({
          name: "",
          email: "",
          phone: "",
          nationality: "",
          message: `Hi, I am interested in "${property.title}" (Ref: ${
            property.erpId || `MANUAL-${property.id}`
          }). Please contact me.`,
        });
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred. Please try again.");
    } finally {
      setSubmitted(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault(); setBookingError("");
    const form = new FormData();
    form.append("propertyId", String(property.id)); form.append("propertyName", property.title);
    form.append("name", booking.name); form.append("email", booking.email); form.append("phone", booking.phone); form.append("nationality", booking.nationality);
    if (booking.passport) form.append("passport", booking.passport);
    const response = await fetch("/api/bookings", { method: "POST", body: form });
    if (response.ok) setBookingSent(true); else setBookingError((await response.json()).error || "Unable to send booking form.");
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Unified Sticky Header */}


      {/* Main Details Body */}
      <div className={styles.container}>
        <Link href="/" className={styles.backBtn}>
          &larr; Back to Home page
        </Link>

        <div className={styles.grid}>
          {/* Left Column: Photos, specs, description */}
          <div>
            {/* Gallery */}
            <div className={styles.gallerySection}>
              <div className={styles.mainImageWrapper}>
                {imagesList.length > 0 ? (
                  <img
                    src={imagesList[activeImageIndex]}
                    alt={property.title}
                    className={styles.mainImage}
                  />
                ) : (
                  <div className={styles.noImage}>🏢</div>
                )}
              </div>

              {imagesList.length > 1 && (
                <div className={styles.thumbnails}>
                  {imagesList.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`${styles.thumbnailItem} ${
                        activeImageIndex === index ? styles.thumbnailActive : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt="Thumbnail"
                        className={styles.thumbnailImg}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <h3>Property Overview</h3>
              <p>
                {property.description ||
                  "No description provided. Please contact the listing agent using the form on the right for full particulars and developer booklets."}
              </p>
            </div>

            {isTwinTower && (
              <>
                <div className={styles.propertyInfoSection}>
                  <h3>Property Information</h3>
                  <div className={styles.infoGrid}>
                    <div><span>Type</span><strong>Apartment</strong></div>
                    <div><span>Furnishing</span><strong>Unfurnished</strong></div>
                    <div><span>Purpose</span><strong>For Rent</strong></div>
                    <div><span>Reference no.</span><strong>BAYUT-10220-mTLK8P</strong></div>
                    <div><span>Building Name</span><strong>A.W. Bin Shabib Twin Towers</strong></div>
                  </div>
                </div>

                <div className={styles.amenitiesSection}>
                  <h3>Features / Amenities</h3>
                  <div className={styles.amenitiesGrid}>
                    {amenities.slice(0, showAllAmenities ? amenities.length : 5).map((amenity) => (
                      <div key={amenity.label} className={styles.amenityCard}>
                        <span className={styles.amenityIcon} aria-hidden="true">{amenity.icon}</span>
                        <span>{amenity.label}</span>
                      </div>
                    ))}
                    {!showAllAmenities && (
                      <button type="button" className={styles.moreAmenities} onClick={() => setShowAllAmenities(true)}>
                        + 2 more amenities
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Property summary and enquiry */}
          <aside className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${property.purpose === "Buy" ? styles.badgeSale : styles.badgeRent}`}>
                  For {property.purpose === "Buy" ? "Sale" : "Rent"}
                </span>
                {property.status !== "Ready" && <span className={`${styles.badge} ${styles.badgeStatus}`}>{property.status}</span>}
              </div>
              <span className={styles.sourceBadge}>{property.erpId ? `Ref. ${property.erpId}` : "Exclusive listing"}</span>
              <h1 className={styles.title}>{property.title}</h1>
              <div className={styles.location}>📍 {property.location}</div>
              <div className={styles.price}>{formatPrice(property.price)}{property.purpose === "Rent" && <span className={styles.pricePeriod}> / Yearly</span>}</div>
              <div className={styles.specsBox}>
                <div className={styles.specCard}><div className={styles.specVal}>{property.beds === 0 ? "Studio" : property.beds}</div><div className={styles.specLabel}>{property.beds === 0 ? "Apartment" : "Bedrooms"}</div></div>
                <div className={styles.specCard}><div className={styles.specVal}>{property.baths}</div><div className={styles.specLabel}>{property.baths === 1 ? "Bathroom" : "Bathrooms"}</div></div>
                <div className={styles.specCard}><div className={styles.specVal}>{new Intl.NumberFormat().format(property.area)}</div><div className={styles.specLabel}>Sq. Ft.</div></div>
              </div>
              <div className={styles.bookingActions}>
                <span className={styles.vacancyBadge}>2 Vacant Units</span>
                <button
  type="button"
  className={styles.bookNowButton}
  onClick={() =>
    setBookingOpen(true)
  }
>
  Book Now
</button>
              </div>
            </div>
            <div className={styles.sidebarCard}>
              {!submittedDetails ? (
                <>
                  <h4>Enquire About Property</h4>
                  <p>Send details to our specialized brokers for this location.</p>

                  <form onSubmit={handleEnquirySubmit}>
                    <div className={styles.formGroup}>
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={enquiry.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={enquiry.email}
                        onChange={handleInputChange}
                        placeholder="email@address.com"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={enquiry.phone}
                        onChange={handleInputChange}
                        placeholder="+971 50 123 4567"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Nationality</label>
                      <select name="nationality" value={enquiry.nationality} onChange={(e) => setEnquiry((prev) => ({ ...prev, nationality: e.target.value }))} required className={styles.input}>
                        <option value="">Select nationality</option>
                        {nationalityCodes.map((code) => <option key={code} value={countryNames.of(code) || code}>{countryNames.of(code) || code}</option>)}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Message</label>
                      <textarea
                        name="message"
                        value={enquiry.message}
                        onChange={handleInputChange}
                        required
                        className={styles.textarea}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitted}
                      className={styles.submitBtn}
                    >
                      {submitted ? "Sending..." : "Enquire Now"}
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
                  <h4 style={{ fontSize: "18px", color: "#1e3a8a", marginBottom: "8px" }}>Enquiry Sent!</h4>
                  <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
                    Dear <strong>{submittedDetails.name}</strong>, thank you. We have logged your interest in this property.
                  </p>

                  <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "12px", textAlign: "left", fontSize: "12px", color: "#334155", marginBottom: "16px" }}>
                    <div><strong>Property:</strong> {property.title}</div>
                    <div style={{ marginTop: "4px" }}><strong>Phone:</strong> {submittedDetails.phone}</div>
                  </div>

                  <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px", fontSize: "11px", color: "#1e40af", marginBottom: "16px", lineHeight: "1.4" }}>
                    📧 A confirmation email has been dispatched to: <strong>{submittedDetails.email}</strong>
                  </div>

                  <a
                    href={`https://wa.me/97143298000?text=Hello%20Abdul%20Wahed%20Bin%20Shabib%20Real%20Estate!%20I%20have%20submitted%20an%20enquiry%20regarding%20property%20"${encodeURIComponent(property.title)}"%20(Ref:%20${encodeURIComponent(property.erpId || `MANUAL-${property.id}`)}).%20My%20name%20is%20${encodeURIComponent(submittedDetails.name)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      backgroundColor: "#25D366",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "12px 16px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      marginBottom: "12px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#128C7E")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
                  >
                    💬 Chat on WhatsApp
                  </a>

                  <button
                    onClick={() => setSubmittedDetails(null)}
                    style={{
                      backgroundColor: "transparent",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Send Another Enquiry
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* {bookingOpen && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="Book this property">
        <div className={styles.bookingModal}>
          <button className={styles.closeModal} type="button" onClick={() => setBookingOpen(false)} aria-label="Close booking form">×</button>
          {!bookingSent ? <><h2>Book this property</h2><p className={styles.modalProperty}>{property.title}<br />AED 35,000 / Yearly</p>
            <form onSubmit={submitBooking} className={styles.bookingForm}>
              <input value={property.title} readOnly aria-label="Property" />
              <input required placeholder="Full name" value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
              <input required type="email" placeholder="Email address" value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} />
              <input required type="tel" placeholder="Phone number" value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} />
              <select required aria-label="Nationality" value={booking.nationality} onChange={(e) => setBooking({ ...booking, nationality: e.target.value })}>
                <option value="">Select nationality</option>
                {nationalityCodes.map((code) => <option key={code} value={countryNames.of(code) || code}>{countryNames.of(code) || code}</option>)}
              </select>
              <label className={styles.passportLabel}>Passport copy (PDF, JPG or PNG, max 5 MB)<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setBooking({ ...booking, passport: e.target.files?.[0] || null })} /></label>
              {bookingError && <p className={styles.bookingError}>{bookingError}</p>}<button className={styles.bookNowButton}>Send Booking Form</button>
            </form></> : <div className={styles.bookingSuccess}><h2>Booking form sent</h2><p>Thank you. Our representative will review availability and call you shortly to confirm your booking.</p><button className={styles.bookNowButton} onClick={() => setBookingOpen(false)}>Close</button></div>}
        </div>
      </div>} */}

      {/* <BookingModal
  open={bookingOpen}
  property={{
    id: property.id,
    title: property.title,
  }}
  onClose={() =>
    setBookingOpen(false)
  }
/> */}


    </div>
  );
}

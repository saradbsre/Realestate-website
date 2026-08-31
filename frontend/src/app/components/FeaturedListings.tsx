"use client";

import React from "react";
import Link from "next/link";
import styles from "./featuredListings.module.css";
import type { Property } from "@/lib/propertyApi";
import BookingModal from "./BookingModal/BookingModal";
import {
  MapPin,
  Building2,
  Ruler,
} from "lucide-react";
interface FeaturedListingsProps {
  properties: Property[];
}

export default function FeaturedListings({ properties }: FeaturedListingsProps) {
  const [bookingProperty, setBookingProperty] = React.useState<Property | null>(null);
  // const [booking, setBooking] = React.useState({ name: "", email: "", phone: "", nationality: "", passport: null as File | null });
  // const [bookingSent, setBookingSent] = React.useState(false);
  // const [bookingError, setBookingError] = React.useState("");
  // const nationalityCodes = "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");
  // const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(price);
  };
  // const submitBooking = async (event: React.FormEvent) => { event.preventDefault(); if (!bookingProperty) return; setBookingError(""); 
  //   const form = new FormData(); form.append("propertyId", String(bookingProperty.id));
  //    form.append("propertyName", bookingProperty.title); 
  //    form.append("name", booking.name);
  //     form.append("email", booking.email);
  //      form.append("phone", booking.phone);
  //       form.append("nationality", booking.nationality);
  //        if (booking.passport) form.append("passport", booking.passport);
  //         const response = await fetch("/api/bookings", { method: "POST", body: form });
  //          if (response.ok) setBookingSent(true); 
  //          else setBookingError((await response.json()).error || "Unable to send booking form."); };

console.log(
  "FEATURED PROPERTY:",
  properties[0]
);

           function compactAvailableTypes(value: string) {
  const list = value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (list.length <= 3) {
    return list.join(" • ");
  }

  return `${list.slice(0, 3).join(" • ")} +${list.length - 3} more`;
}
  return (
    <section id="listings" className={styles.section}>
      <div className={styles.titleArea}>
        <h2>Featured Properties</h2>
        <p>Explore handpicked luxury residential and commercial properties</p>
      </div>

      <div className={styles.grid}>
        {properties.length === 0 ? (
          <div className={styles.noResults}>
            <p style={{ fontSize: "20px", marginBottom: "8px", fontWeight: 600 }}>No Properties Found</p>
            <p>Try modifying your search filter options.</p>
          </div>
        ) : (
          properties.map((prop) => {
  
  const propertyImage =
        prop.primaryImageUrl ||
        null;
  return (
              <Link href={`/property?id=${encodeURIComponent(
  prop.id
)}`} key={prop.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {/* Badges Overlay */}
                  {/* <div className={styles.badges}>
                    <span
                      className={`${styles.badge} ${
                        prop.purpose === "Buy" ? styles.badgeSale : styles.badgeRent
                      }`}
                    >
                      For {prop.purpose === "Buy" ? "Sale" : "Rent"}
                    </span>
                    {prop.status !== "Ready" && (
                      <span className={`${styles.badge} ${styles.badgeStatus}`}>
                        {prop.status}
                      </span>
                    )}
                  </div> */}

                  {/* ERP vs Manual Badge */}
                  {/* <span className={styles.sourceBadge}>
                    {prop.erpId ? `ERP: ${prop.erpId}` : "Exclusive manual listing"}
                  </span> */}

                  {/* Photo */}
               {/* Photo */}
{propertyImage ? (
  <img
    src={propertyImage}
    alt={prop.title}
    className={styles.image}
    draggable={false}
  />
) : (
  <div className={styles.fallbackImage}>
    🏢
  </div>
)}
                </div>

               <div className={styles.content}>
  {/* Price */}
  <div className={styles.priceBlock}>
    <div className={styles.price}>
      {prop.price > 0 ? (
        <>
          {prop.maxPrice > prop.price && (
            <span className={styles.fromText}>From </span>
          )}
          {formatPrice(prop.price)}
          {prop.purpose === "Rent" && (
            <span className={styles.pricePeriod}> / Yearly</span>
          )}
        </>
      ) : (
        <span className={styles.priceOnRequest}>Price on Request</span>
      )}
    </div>
  </div>

  {/* Title */}
  <h3 className={styles.title}>{prop.title}</h3>

  {/* Location */}
<div className={styles.location}>
  <MapPin
    className={styles.locationIcon}
    size={17}
    strokeWidth={2}
  />

  <span className={styles.locationText}>
    {prop.location}
  </span>
</div>

  {/* Divider */}
  <div className={styles.divider}></div>

  {/* Property type */}
  <div className={styles.metaRow}>
    <div className={styles.metaItem}>
      <span className={styles.metaIcon}>🏢</span>
      <span className={styles.metaText} title={prop.availableTypes}>
        {compactAvailableTypes(prop.availableTypes)}

      </span>
    </div>
  </div>

  {/* Area */}
  <div className={styles.metaRow}>
    <div className={styles.metaItem}>
      <span className={styles.metaIcon}>📐</span>
      <span className={styles.metaText}>
        {prop.maxArea > prop.area
          ? `${prop.area.toLocaleString()} - ${prop.maxArea.toLocaleString()} Sq.Ft.`
          : `${prop.area.toLocaleString()} Sq.Ft.`}
      </span>
    </div>
  </div>

  {/* Actions */}
  <div
    className={styles.bookingActions}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
    }}
  >
    <span className={styles.vacancyBadge}>
      {prop.vacantUnits} Vacant Units
    </span>

<button
  type="button"
  className={styles.bookNowButton}
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();

    setBookingProperty(prop);
  }}
>
  Book Now
</button>
  </div>
</div>
              </Link>
            );
          })
        )}
      </div>
      {properties.length > 0 && (
  <div className={styles.viewAllWrapper}>
    <Link
      href="/properties"
      className={styles.viewAllButton}
    >
      See All Properties
      <span>→</span>
    </Link>
  </div>
)}
<BookingModal
  open={bookingProperty !== null}
  property={
    bookingProperty
      ? {
          id: bookingProperty.id,
          title: bookingProperty.title,
        }
      : null
  }
  onClose={() =>
    setBookingProperty(null)
  }
/>
      
    </section>
  );
}

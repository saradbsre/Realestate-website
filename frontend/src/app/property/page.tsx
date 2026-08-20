"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import BookingModal from "../components/BookingModal/BookingModal";
import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

import {
  Building2,
  Check,
  Grid2X2,
  Layers,
  MapPin,
  Ruler,
  ShieldCheck,
  WalletCards,
  Wind,
  Car,
  Wrench,
  MapPinned,
  ChevronRight,
  Home,
} from "lucide-react";
import {
  getProperty,
  getPropertyUnits,
  type Property,
  type PropertyUnit,
} from "@/lib/propertyApi";

import styles from "./property.module.css";

/* =========================================================
   DUMMY BUILDING IMAGES

   Add these images inside:
   public/building-demo/
========================================================= */

const BUILDING_IMAGES = [
  "/Twin-Tower.jpg",  
  "/bin-shabib-twin-tower/1.webp",
  "/bin-shabib-twin-tower/2.webp",
  "/bin-shabib-twin-tower/3.webp",
  "/bin-shabib-twin-tower/4.webp",
  "/bin-shabib-twin-tower/5.webp",
  "/bin-shabib-twin-tower/6.webp",
  "/bin-shabib-twin-tower/7.webp",
  "/bin-shabib-twin-tower/8.webp",
  "/bin-shabib-twin-tower/9.webp",
  "/bin-shabib-twin-tower/10.webp",
  "/bin-shabib-twin-tower/11.webp"
];

/* =========================================================
   DUMMY AMENITIES

   Later replace from DB/API.
========================================================= */

const DUMMY_AMENITIES = [
  {
    label: "24/7 Security",
    icon: ShieldCheck,
  },
  {
    label: "Covered Parking",
    icon: Car,
  },
  {
    label: "Central AC",
    icon: Wind,
  },
  {
    label: "Maintenance Support",
    icon: Wrench,
  },
  {
    label: "Elevator Access",
    icon: Grid2X2,
  },
  {
    label: "Prime Location",
    icon: MapPinned,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function PropertyDetailContent() {
const searchParams = useSearchParams();

const buildingId =
  searchParams.get("id")?.trim() || "";

  /* =======================================================
     DATA
  ======================================================= */

  const [
    property,
    setProperty,
  ] =
    useState<Property | null>(
      null
    );

  const [
    units,
    setUnits,
  ] =
    useState<PropertyUnit[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");
const [
  bookingUnit,
  setBookingUnit,
] = useState<PropertyUnit | null>(null);
  /* =======================================================
     SELECTED PROPERTY TYPE
  ======================================================= */

  const [
    selectedType,
    setSelectedType,
  ] =
    useState("");

  /* =======================================================
     SELECTED IMAGE
  ======================================================= */

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState(0);
const touchStartX =
  useRef<number | null>(null);

const touchEndX =
  useRef<number | null>(null);

const handleTouchStart = (
  event: TouchEvent<HTMLDivElement>
) => {
  touchEndX.current = null;

  touchStartX.current =
    event.targetTouches[0].clientX;
};

const handleTouchMove = (
  event: React.TouchEvent<HTMLDivElement>
) => {
  touchEndX.current =
    event.targetTouches[0].clientX;
};

const handleTouchEnd = () => {
  if (
    touchStartX.current === null ||
    touchEndX.current === null
  ) {
    return;
  }

  const distance =
    touchStartX.current -
    touchEndX.current;

  const minimumSwipeDistance = 50;

  // Swipe LEFT → next image
  if (
    distance > minimumSwipeDistance
  ) {
    setSelectedImage((current) =>
      current ===
      BUILDING_IMAGES.length - 1
        ? 0
        : current + 1
    );
  }

  // Swipe RIGHT → previous image
  if (
    distance < -minimumSwipeDistance
  ) {
    setSelectedImage((current) =>
      current === 0
        ? BUILDING_IMAGES.length - 1
        : current - 1
    );
  }

  touchStartX.current = null;
  touchEndX.current = null;
};

  /* =======================================================
     LOAD PROPERTY
  ======================================================= */

  useEffect(() => {
    if (!buildingId) {
      return;
    }

    async function loadPropertyData() {
      try {
        setLoading(true);
        setError("");

        const [
          propertyData,
          unitData,
        ] =
          await Promise.all([
            getProperty(
              buildingId
            ),

            getPropertyUnits(
              buildingId
            ),
          ]);

        setProperty(
          propertyData
        );

        setUnits(
          unitData.units
        );
      } catch (error) {
        console.error(
          "Unable to load property:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load property"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPropertyData();
  }, [
    buildingId,
  ]);

  /* =======================================================
     PROPERTY TYPE GROUPS
  ======================================================= */

  const propertyTypes =
    useMemo(() => {
      const groups =
        new Map<
          string,
          {
            name: string;
            code: string;
            count: number;
          }
        >();

      units.forEach(
        (unit) => {
          const name =
            unit.propertyType ||
            unit.unitName ||
            "Other";

          const key =
            name
              .trim()
              .toUpperCase();

          const existing =
            groups.get(key);

          if (existing) {
            existing.count +=
              1;
          } else {
            groups.set(
              key,
              {
                name,
                code:
                  unit.purposeCode ||
                  "",
                count: 1,
              }
            );
          }
        }
      );

      return Array.from(
        groups.values()
      );
    }, [units]);

  /* =======================================================
     DEFAULT TAB
  ======================================================= */

  useEffect(() => {
    if (
      propertyTypes.length >
        0 &&
      !selectedType
    ) {
      setSelectedType(
        propertyTypes[0].name
      );
    }
  }, [
    propertyTypes,
    selectedType,
  ]);

  /* =======================================================
     VISIBLE UNITS
  ======================================================= */

  const visibleUnits =
    useMemo(() => {
      if (!selectedType) {
        return [];
      }

      return units.filter(
        (unit) => {
          const typeName =
            unit.propertyType ||
            unit.unitName ||
            "Other";

          return (
            typeName
              .trim()
              .toUpperCase() ===
            selectedType
              .trim()
              .toUpperCase()
          );
        }
      );
    }, [
      units,
      selectedType,
    ]);

  /* =======================================================
     TYPE SUMMARY
  ======================================================= */

  const typeSummary =
    useMemo(() => {
      const rents =
        visibleUnits
          .map((unit) =>
            Number(
              unit.annualRent ||
                0
            )
          )
          .filter(
            (rent) =>
              rent > 0
          );

      const areas =
        visibleUnits
          .map((unit) =>
            Number(
              unit.area ||
                0
            )
          )
          .filter(
            (area) =>
              area > 0
          );

      return {
        minRent:
          rents.length
            ? Math.min(
                ...rents
              )
            : 0,

        maxRent:
          rents.length
            ? Math.max(
                ...rents
              )
            : 0,

        minArea:
          areas.length
            ? Math.min(
                ...areas
              )
            : 0,

        maxArea:
          areas.length
            ? Math.max(
                ...areas
              )
            : 0,
      };
    }, [
      visibleUnits,
    ]);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  function formatPrice(
    price:
      | number
      | null
      | undefined
  ) {
    const amount =
      Number(
        price || 0
      );

    if (amount <= 0) {
      return "Price on Request";
    }

    return new Intl.NumberFormat(
      "en-AE",
      {
        style:
          "currency",

        currency:
          "AED",

        maximumFractionDigits:
          0,
      }
    ).format(amount);
  }

  const breadcrumbLocationParts = useMemo(() => {
  if (!property?.location) {
    return [];
  }

  return property.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}, [property?.location]);
  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className={
          styles.statePage
        }
      >
        <Building2
          size={40}
        />

        <h2>
          Loading property...
        </h2>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !property
  ) {
    return (
      <main
        className={
          styles.statePage
        }
      >
        <h1>
          Property unavailable
        </h1>

        <p>
          {error ||
            "Property not found"}
        </p>

        <Link
          href="/properties"
        >
          Back to Properties
        </Link>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className={
        styles.page
      }
    >


      {/* =================================================
          PROPERTY HEADER
      ================================================= */}

<div className={styles.breadcrumbBar}>
  <div className={styles.container}>
    <nav
      className={styles.breadcrumb}
      aria-label="Breadcrumb"
    >
      {/* HOME */}

      <Link
        href="/"
        className={styles.breadcrumbLink}
      >
        <Home size={15} />

        <span>
          Home
        </span>
      </Link>

      <ChevronRight
        size={15}
        className={styles.breadcrumbArrow}
      />

      {/* PROPERTIES */}

      <Link
        href="/properties"
        className={styles.breadcrumbLink}
      >
        Properties for Rent
      </Link>

      {/* DYNAMIC LOCATION */}

      {breadcrumbLocationParts.map(
        (part, index) => (
          <span
            key={`${part}-${index}`}
            className={styles.breadcrumbGroup}
          >
            <ChevronRight
              size={15}
              className={styles.breadcrumbArrow}
            />

            <Link
              href={`/properties?search=${encodeURIComponent(
                part
              )}`}
              className={styles.breadcrumbLink}
            >
              {part}
            </Link>
          </span>
        )
      )}

      {/* CURRENT BUILDING */}

      <ChevronRight
        size={15}
        className={styles.breadcrumbArrow}
      />

      <span
        className={styles.breadcrumbCurrent}
        title={property.title}
      >
        {property.title}
      </span>
    </nav>
  </div>
</div>
      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className={
          styles.container
        }
      >
        {/* =================================================
    BUILDING IMAGE
================================================= */}

<section className={styles.gallerySection}>
  <div className={styles.sectionHeadingRow}>
    <div>
      <h2>Property Overview</h2>

      <p>
        View the building and key property information.
      </p>
    </div>

    {BUILDING_IMAGES.length > 1 && (
      <span className={styles.photoCount}>
        {BUILDING_IMAGES.length} Photos
      </span>
    )}
  </div>

  <div className={styles.propertyOverviewGrid}>
    {/* IMAGE */}

    <div
  className={styles.buildingImageArea}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
      <img
  src={BUILDING_IMAGES[selectedImage]}
  alt={property.title}
  className={styles.buildingMainImage}
  draggable={false}
/>

      <div className={styles.imageBadge}>
        <Building2 size={15} />

        Property for Rent
      </div>

      {BUILDING_IMAGES.length > 1 && (
        <div className={styles.imageCounter}>
          {selectedImage + 1} / {BUILDING_IMAGES.length}
        </div>
      )}
    </div>

    {/* PROPERTY INFORMATION */}

    <div className={styles.overviewDetails}>
      <div className={styles.overviewTitle}>
        <span>PROPERTY DETAILS</span>

        <h2>{property.title}</h2>

        <div className={styles.overviewLocation}>
          <MapPin size={17} />

          <span>{property.location}</span>
        </div>
      </div>

      <div className={styles.overviewStats}>
        <div className={styles.overviewStat}>
          <div className={styles.overviewStatIcon}>
            <Building2 size={19} />
          </div>

          <div>
            <span>Building ID</span>
            <strong>{property.id}</strong>
          </div>
        </div>

        <div className={styles.overviewStat}>
          <div className={styles.overviewStatIcon}>
            <Layers size={19} />
          </div>

          <div>
            <span>Vacant Units</span>
            <strong>{units.length}</strong>
          </div>
        </div>

        <div className={styles.overviewStat}>
          <div className={styles.overviewStatIcon}>
            <Grid2X2 size={19} />
          </div>

          <div>
            <span>Property Types</span>
            <strong>{propertyTypes.length}</strong>
          </div>
        </div>
      </div>

      {/* PROPERTY TYPES */}

      <div className={styles.overviewTypes}>
        <span className={styles.overviewTypesLabel}>
          Available Property Types
        </span>

        <div className={styles.overviewTypeList}>
          {propertyTypes.map((type) => (
            <span
              key={type.name}
              className={styles.overviewTypeChip}
            >
              {type.name}

              <small>
                {type.count}
              </small>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* ONLY SHOW THUMBNAILS IF MULTIPLE IMAGES EXIST */}

  {BUILDING_IMAGES.length > 1 && (
    <div className={styles.thumbnailRow}>
      {BUILDING_IMAGES.map((image, index) => (
        <button
          key={image}
          type="button"
          onClick={() => setSelectedImage(index)}
          className={`${styles.thumbButton} ${
            selectedImage === index
              ? styles.thumbActive
              : ""
          }`}
        >
          <img
            src={image}
            alt={`${property.title} ${index + 1}`}
            className={styles.thumbImage}
            draggable={false}
          />
        </button>
      ))}
    </div>
  )}
</section>
       

      

        {/* =================================================
            AMENITIES
        ================================================= */}

    <section className={styles.amenitiesSection}>
  <div className={styles.sectionHeading}>
    <h2>Building Amenities</h2>

    <p>
      Facilities and services available for this property.
    </p>
  </div>

  <div className={styles.amenitiesGrid}>
    {DUMMY_AMENITIES.map((amenity) => {
      const Icon = amenity.icon;

      return (
        <div
          key={amenity.label}
          className={styles.amenityCard}
        >
          <div className={styles.amenityIcon}>
            <Icon size={18} />
          </div>

          <span>{amenity.label}</span>

          <Check
            size={15}
            className={styles.amenityCheck}
          />
        </div>
      );
    })}
  </div>
</section>

        {/* =================================================
            AVAILABLE UNITS
        ================================================= */}

        <section
          className={
            styles.unitsSection
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <h2>
              Available Units
            </h2>

            <p>
             Choose a property type below to view its available units,annual rent, size and booking details.
            </p>
          </div>

          {/* =================================================
              PROPERTY TYPE TABS
          ================================================= */}

          <div
            className={
              styles.propertyTabs
            }
          >
            {propertyTypes.map(
              (
                type
              ) => (
                <button
                  key={
                    type.name
                  }
                  type="button"
                  onClick={() =>
                    setSelectedType(
                      type.name
                    )
                  }
                  className={`${styles.propertyTab} ${
                    selectedType ===
                    type.name
                      ? styles.propertyTabActive
                      : ""
                  }`}
                >
                  <span>
                    {
                      type.name
                    }
                  </span>

                  <small>
                    {
                      type.count
                    }
                  </small>
                </button>
              )
            )}
          </div>

          {/* =================================================
              SELECTED TYPE HEADER
          ================================================= */}

          {selectedType && (
            <div
              className={
                styles.selectedTypeHeader
              }
            >
              <div>
                <h3>
                  {
                    selectedType
                  }
                </h3>

                <span>
                  {
                    visibleUnits.length
                  }{" "}
                  vacant{" "}
                  {visibleUnits.length ===
                  1
                    ? "unit"
                    : "units"}
                </span>
              </div>

              <div
                className={
                  styles.selectedTypeStats
                }
              >
                {/* RENT */}

                <div>
                  <span>
                    Annual Rent
                  </span>

                  <strong>
                    {typeSummary.minRent ===
                    typeSummary.maxRent
                      ? formatPrice(
                          typeSummary.minRent
                        )
                      : `${formatPrice(
                          typeSummary.minRent
                        )} - ${formatPrice(
                          typeSummary.maxRent
                        )}`}
                  </strong>
                </div>

                {/* AREA */}

                <div>
                  <span>
                    Area
                  </span>

                  <strong>
                    {typeSummary.minArea ===
                    typeSummary.maxArea
                      ? `${typeSummary.minArea.toLocaleString()} Sq.Ft.`
                      : `${typeSummary.minArea.toLocaleString()} - ${typeSummary.maxArea.toLocaleString()} Sq.Ft.`}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              UNIT TABLE
          ================================================= */}

          <div
            className={
              styles.unitTableWrapper
            }
          >
            {/* HEADER */}

            <div
              className={
                styles.unitTableHeader
              }
            >
              <div>
                Unit Details
              </div>

              <div>
                Annual Rent
              </div>

              <div>
                Unit Information
              </div>

              <div>
                Action
              </div>
            </div>

            {/* ROWS */}

            {visibleUnits.map(
              (
                unit,
                index
              ) => (
                <article
                  key={`${unit.referenceNo || selectedType}-${index}`}
                  className={
                    styles.unitRow
                  }
                >
                  {/* =====================================
                      UNIT DETAILS
                  ===================================== */}

                  <div
                    className={
                      styles.unitMain
                    }
                  >
                    <h4>
                      {unit.unitName ||
                        unit.propertyType}
                    </h4>

                    {unit.referenceNo && (
                      <div
                        className={
                          styles.reference
                        }
                      >
                        Ref:{" "}
                        {
                          unit.referenceNo
                        }
                      </div>
                    )}

                    <div
                      className={
                        styles.unitFeatures
                      }
                    >
                      {/* AREA */}

                      <span>
                        <Ruler
                          size={
                            15
                          }
                        />

                        {Number(
                          unit.area ||
                            0
                        ).toLocaleString()}{" "}
                        Sq.Ft.
                      </span>

                      {/* FLOOR */}

                      {unit.floorNumber !==
                        null &&
                        unit.floorNumber !==
                          undefined && (
                          <span>
                            <Layers
                              size={
                                15
                              }
                            />

                            Floor{" "}
                            {
                              unit.floorNumber
                            }
                          </span>
                        )}
                    </div>

                    <div
                      className={
                        styles.availableBadge
                      }
                    >
                      <Check
                        size={14}
                      />

                      Available
                    </div>
                  </div>

                  {/* =====================================
                      RENT
                  ===================================== */}

                  <div
                    className={
                      styles.unitPrice
                    }
                  >
                    <strong>
                      {formatPrice(
                        unit.annualRent
                      )}
                    </strong>

                    {Number(
                      unit.annualRent ||
                        0
                    ) > 0 && (
                      <span>
                        per year
                      </span>
                    )}

                    
                  </div>

                  {/* =====================================
                      INFORMATION
                  ===================================== */}

                  <div
                    className={
                      styles.unitInformation
                    }
                  >
                    {unit.numberOfPayments && (
                      <div>
                        <WalletCards
                          size={
                            15
                          }
                        />

                        <span>
                          {
                            unit.numberOfPayments
                          }{" "}
                          payments
                        </span>
                      </div>
                    )}

                    <div>
                      <Check
                        size={
                          15
                        }
                      />

                      <span>
                        Vacant &
                        available
                      </span>
                    </div>

                    {unit.airConditioning && (
                      <div>
                        <Check
                          size={
                            15
                          }
                        />

                        <span>
                          Air
                          conditioning
                        </span>
                      </div>
                    )}
                  </div>

                  {/* =====================================
                      ACTION
                  ===================================== */}

                  <div
                    className={
                      styles.unitAction
                    }
                  >
                   <button
  type="button"
  className={
    styles.bookButton
  }
  onClick={() =>
    setBookingUnit(unit)
  }
>
  Book Now
</button>

                   
                  </div>
                </article>
              )
            )}
          </div>
        </section>

   <BookingModal
  open={bookingUnit !== null}
  property={
    bookingUnit
      ? {
          id: property.id,
          title: property.title,

          unitReference:
            bookingUnit.referenceNo,

          unitType:
            bookingUnit.propertyType,
        }
      : null
  }
  onClose={() =>
    setBookingUnit(null)
  }
/>
      </div>
    </main>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <main
          className={styles.statePage}
        >
          <Building2
            size={40}
          />

          <h2>
            Loading property...
          </h2>
        </main>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}
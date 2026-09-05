"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

import BookingModal from "../components/BookingModal/BookingModal";

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
   API
========================================================= */

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";


/* =========================================================
   IMAGE TYPE
========================================================= */

interface PropertyImage {
  imageId:
    number;

  imagePath:
    string;

  imageUrl:
    string | null;

  fileName:
    string | null;

  displayOrder:
    number;

  isPrimary:
    boolean;
}


/* =========================================================
   AMENITIES
========================================================= */

const DUMMY_AMENITIES = [
  {
    label:
      "24/7 Security",

    icon:
      ShieldCheck,
  },

  {
    label:
      "Covered Parking",

    icon:
      Car,
  },

  {
    label:
      "Central AC",

    icon:
      Wind,
  },

  {
    label:
      "Maintenance Support",

    icon:
      Wrench,
  },

  {
    label:
      "Elevator Access",

    icon:
      Grid2X2,
  },

  {
    label:
      "Prime Location",

    icon:
      MapPinned,
  },
];


/* =========================================================
   MAIN CONTENT
========================================================= */

function PropertyDetailContent() {
  const searchParams =
    useSearchParams();

  const buildingId =
    searchParams
      .get("id")
      ?.trim() ||
    "";


  /* =======================================================
     PROPERTY DATA
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
  ] =
    useState<PropertyUnit | null>(
      null
    );


  /* =======================================================
     VIEW MODE
  ======================================================= */

  const [
    unitView,
    setUnitView,
  ] =
    useState<
      "table" |
      "card"
    >(
      "table"
    );


  useEffect(() => {
    if (
      window.innerWidth <=
      650
    ) {
      setUnitView(
        "card"
      );
    }
  }, []);


  /* =======================================================
     BUILDING IMAGES
  ======================================================= */

  const [
    buildingImages,
    setBuildingImages,
  ] =
    useState<
      PropertyImage[]
    >(
      []
    );

  const [
    loadingBuildingImages,
    setLoadingBuildingImages,
  ] =
    useState(false);

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState(0);


  /* =======================================================
     FULL PROPERTY GALLERY
  ======================================================= */

  const [
    galleryOpen,
    setGalleryOpen,
  ] =
    useState(false);

  const [
    galleryIndex,
    setGalleryIndex,
  ] =
    useState(0);


  const openBuildingGallery =
    (
      index:
        number = 0
    ) => {
      if (
        buildingImages.length ===
        0
      ) {
        return;
      }

      const safeIndex =
        Math.max(
          0,
          Math.min(
            index,
            buildingImages.length -
              1
          )
        );

      setGalleryIndex(
        safeIndex
      );

      setSelectedImage(
        safeIndex
      );

      setGalleryOpen(
        true
      );
    };


  const closeBuildingGallery =
    () => {
      setGalleryOpen(
        false
      );
    };


  /*
   * Lock body scroll while
   * full gallery is open.
   */
  useEffect(() => {
  if (!galleryOpen) return;

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setGalleryOpen(false);
    }
  };

  window.addEventListener("keydown", handleEscape);

  return () => {
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("keydown", handleEscape);
  };
}, [galleryOpen]);


  /* =======================================================
     UNIT IMAGE MODAL
  ======================================================= */

  const [
    selectedImageUnit,
    setSelectedImageUnit,
  ] =
    useState<PropertyUnit | null>(
      null
    );

  const [
    unitImages,
    setUnitImages,
  ] =
    useState<
      PropertyImage[]
    >(
      []
    );

  const [
    loadingUnitImages,
    setLoadingUnitImages,
  ] =
    useState(false);

  const [
    selectedUnitImageIndex,
    setSelectedUnitImageIndex,
  ] =
    useState(0);


  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  const [
    selectedType,
    setSelectedType,
  ] =
    useState("");


  /* =======================================================
     REFS
  ======================================================= */

  const thumbnailRowRef =
    useRef<
      HTMLDivElement |
      null
    >(
      null
    );

  const unitsSectionRef =
    useRef<
      HTMLElement |
      null
    >(
      null
    );

  const touchStartX =
    useRef<
      number |
      null
    >(
      null
    );

  const touchEndX =
    useRef<
      number |
      null
    >(
      null
    );


  /* =======================================================
     OPEN UNIT IMAGES
  ======================================================= */

  const openUnitImages =
    async (
      unit:
        PropertyUnit
    ) => {
      const unitDesc =
        String(
          unit.description ||
            ""
        ).trim();


      if (
        !unitDesc
      ) {
        console.error(
          "unit_desc is missing:",
          unit
        );

        return;
      }


      setSelectedImageUnit(
        unit
      );

      setUnitImages(
        []
      );

      setSelectedUnitImageIndex(
        0
      );


      try {
        setLoadingUnitImages(
          true
        );


        const response =
          await fetch(
            `${API_URL}/api/properties/${encodeURIComponent(
              buildingId
            )}/units/${encodeURIComponent(
              unitDesc
            )}/images`,
            {
              cache:
                "no-store",
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to load unit images."
          );
        }


        const sortedImages:
          PropertyImage[] =
          Array.isArray(
            result.data
          )
            ? [
                ...result.data,
              ].sort(
                (
                  a,
                  b
                ) => {
                  const orderA =
                    Number(
                      a.displayOrder
                    ) ||
                    999999;

                  const orderB =
                    Number(
                      b.displayOrder
                    ) ||
                    999999;


                  if (
                    orderA !==
                    orderB
                  ) {
                    return (
                      orderA -
                      orderB
                    );
                  }


                  return (
                    Number(
                      a.imageId
                    ) -
                    Number(
                      b.imageId
                    )
                  );
                }
              )
            : [];


        setUnitImages(
          sortedImages
        );

        setSelectedUnitImageIndex(
          0
        );
      } catch (
        error
      ) {
        console.error(
          "Unit image load failed:",
          error
        );

        setUnitImages(
          []
        );
      } finally {
        setLoadingUnitImages(
          false
        );
      }
    };


  /* =======================================================
     THUMBNAIL MOUSE WHEEL
  ======================================================= */

  const handleThumbnailWheel =
    (
      event:
        React.WheelEvent<HTMLDivElement>
    ) => {
      const container =
        thumbnailRowRef.current;


      if (
        !container
      ) {
        return;
      }


      const canScrollHorizontally =
        container.scrollWidth >
        container.clientWidth;


      if (
        !canScrollHorizontally
      ) {
        return;
      }


      event.preventDefault();


      container.scrollBy({
        left:
          event.deltaY !==
          0
            ? event.deltaY
            : event.deltaX,

        behavior:
          "smooth",
      });
    };


  /* =======================================================
     LOAD BUILDING IMAGES
  ======================================================= */

  async function loadBuildingImages(
    id:
      string
  ) {
    try {
      setLoadingBuildingImages(
        true
      );


      const response =
        await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(
            id
          )}/images`,
          {
            cache:
              "no-store",
          }
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to load building images."
        );
      }


      const sortedImages:
        PropertyImage[] =
        Array.isArray(
          result.data
        )
          ? [
              ...result.data,
            ].sort(
              (
                a,
                b
              ) => {
                const orderA =
                  Number(
                    a.displayOrder
                  ) ||
                  999999;

                const orderB =
                  Number(
                    b.displayOrder
                  ) ||
                  999999;


                if (
                  orderA !==
                  orderB
                ) {
                  return (
                    orderA -
                    orderB
                  );
                }


                return (
                  Number(
                    a.imageId
                  ) -
                  Number(
                    b.imageId
                  )
                );
              }
            )
          : [];


      setBuildingImages(
        sortedImages
      );

      setSelectedImage(
        0
      );

      setGalleryIndex(
        0
      );
    } catch (
      error
    ) {
      console.error(
        "Building image load failed:",
        error
      );

      setBuildingImages(
        []
      );
    } finally {
      setLoadingBuildingImages(
        false
      );
    }
  }


  /* =======================================================
     BUILDING IMAGE SWIPE
  ======================================================= */

  const handleTouchStart =
    (
      event:
        TouchEvent<HTMLDivElement>
    ) => {
      touchEndX.current =
        null;

      touchStartX.current =
        event.targetTouches[
          0
        ].clientX;
    };


  const handleTouchMove =
    (
      event:
        TouchEvent<HTMLDivElement>
    ) => {
      touchEndX.current =
        event.targetTouches[
          0
        ].clientX;
    };


  const handleTouchEnd =
    () => {
      if (
        touchStartX.current ===
          null ||
        touchEndX.current ===
          null ||
        buildingImages.length ===
          0
      ) {
        return;
      }


      const distance =
        touchStartX.current -
        touchEndX.current;

      const minimumSwipeDistance =
        50;


      if (
        distance >
        minimumSwipeDistance
      ) {
        setSelectedImage(
          (
            current
          ) =>
            current ===
            buildingImages.length -
              1
              ? 0
              : current +
                1
        );
      }


      if (
        distance <
        -minimumSwipeDistance
      ) {
        setSelectedImage(
          (
            current
          ) =>
            current ===
            0
              ? buildingImages.length -
                1
              : current -
                1
        );
      }


      touchStartX.current =
        null;

      touchEndX.current =
        null;
    };


  /* =======================================================
     PROPERTY TYPE NAVIGATION
  ======================================================= */

  const navigateToPropertyType =
    (
      typeName:
        string
    ) => {
      setSelectedType(
        typeName
      );


      requestAnimationFrame(
        () => {
          unitsSectionRef.current
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            });
        }
      );
    };


  /* =======================================================
     LOAD PROPERTY DATA
  ======================================================= */

  useEffect(() => {
    if (
      !buildingId
    ) {
      setLoading(
        false
      );

      return;
    }


    async function loadPropertyData() {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );


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
          unitData.units ||
            []
        );


        await loadBuildingImages(
          buildingId
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to load property:",
          error
        );


        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load property"
        );
      } finally {
        setLoading(
          false
        );
      }
    }


    loadPropertyData();
  }, [
    buildingId,
  ]);


  /* =======================================================
     PROPERTY TYPES
  ======================================================= */

  const propertyTypes =
    useMemo(() => {
      const groups =
        new Map<
          string,
          {
            name:
              string;

            code:
              string;

            count:
              number;
          }
        >();


      units.forEach(
        (
          unit
        ) => {
          const name =
            unit.propertyType ||
            unit.unitName ||
            "Other";


          const key =
            name
              .trim()
              .toUpperCase();


          const existing =
            groups.get(
              key
            );


          if (
            existing
          ) {
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

                count:
                  1,
              }
            );
          }
        }
      );


      return Array.from(
        groups.values()
      );
    }, [
      units,
    ]);


  /* =======================================================
     DEFAULT PROPERTY TYPE
  ======================================================= */

  useEffect(() => {
    if (
      propertyTypes.length >
        0 &&
      !selectedType
    ) {
      setSelectedType(
        propertyTypes[
          0
        ].name
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
      if (
        !selectedType
      ) {
        return [];
      }


      return units.filter(
        (
          unit
        ) => {
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
          .map(
            (
              unit
            ) =>
              Number(
                unit.annualRent ||
                  0
              )
          )
          .filter(
            (
              rent
            ) =>
              rent >
              0
          );


      const areas =
        visibleUnits
          .map(
            (
              unit
            ) =>
              Number(
                unit.area ||
                  0
              )
          )
          .filter(
            (
              area
            ) =>
              area >
              0
          );


      return {
        minRent:
          rents.length >
          0
            ? Math.min(
                ...rents
              )
            : 0,

        maxRent:
          rents.length >
          0
            ? Math.max(
                ...rents
              )
            : 0,

        minArea:
          areas.length >
          0
            ? Math.min(
                ...areas
              )
            : 0,

        maxArea:
          areas.length >
          0
            ? Math.max(
                ...areas
              )
            : 0,
      };
    }, [
      visibleUnits,
    ]);


  /* =======================================================
     PRICE FORMAT
  ======================================================= */

  function formatPrice(
    price:
      | number
      | null
      | undefined
  ) {
    const amount =
      Number(
        price ||
          0
      );


    if (
      amount <=
      0
    ) {
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
    ).format(
      amount
    );
  }


  /* =======================================================
     BREADCRUMB
  ======================================================= */

  const breadcrumbLocationParts =
    useMemo(() => {
      if (
        !property?.location
      ) {
        return [];
      }


      return property.location
        .split(
          ","
        )
        .map(
          (
            part
          ) =>
            part.trim()
        )
        .filter(
          Boolean
        );
    }, [
      property?.location,
    ]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <main
        className={
          styles.statePage
        }
      >
        <Building2
          size={
            40
          }
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
          BREADCRUMB
      ================================================= */}

      <div
        className={
          styles.breadcrumbBar
        }
      >
        <div
          className={
            styles.container
          }
        >
          <nav
            className={
              styles.breadcrumb
            }
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className={
                styles.breadcrumbLink
              }
            >
              <Home
                size={
                  15
                }
              />

              <span>
                Home
              </span>
            </Link>


            <ChevronRight
              size={
                15
              }
              className={
                styles.breadcrumbArrow
              }
            />


            <Link
              href="/properties"
              className={
                styles.breadcrumbLink
              }
            >
              Properties for Rent
            </Link>


            {breadcrumbLocationParts.map(
              (
                part,
                index
              ) => (
                <span
                  key={`${part}-${index}`}
                  className={
                    styles.breadcrumbGroup
                  }
                >
                  <ChevronRight
                    size={
                      15
                    }
                    className={
                      styles.breadcrumbArrow
                    }
                  />

                  <Link
                    href={`/properties?search=${encodeURIComponent(
                      part
                    )}`}
                    className={
                      styles.breadcrumbLink
                    }
                  >
                    {
                      part
                    }
                  </Link>
                </span>
              )
            )}


            <ChevronRight
              size={
                15
              }
              className={
                styles.breadcrumbArrow
              }
            />


            <span
              className={
                styles.breadcrumbCurrent
              }
              title={
                property.title
              }
            >
              {
                property.title
              }
            </span>
          </nav>
        </div>
      </div>


      <div
        className={
          styles.container
        }
      >

        {/* =================================================
            PROPERTY OVERVIEW
        ================================================= */}

     {/* =================================================
    PROPERTY OVERVIEW
================================================= */}

<section className={styles.gallerySection}>
  {/* ===============================================
      HEADING
  =============================================== */}

  <div className={styles.sectionHeadingRow}>
    <div>
      <h2>Property Overview</h2>

      <p>
        View the building and key property information.
      </p>
    </div>

    {buildingImages.length > 0 && (
      <button
        type="button"
        className={styles.photoCount}
        onClick={() =>
          openBuildingGallery(
            selectedImage
          )
        }
      >
        {buildingImages.length}{" "}
        {buildingImages.length === 1
          ? "Photo"
          : "Photos"}
      </button>
    )}
  </div>

  {/* ===============================================
      OVERVIEW CARD
  =============================================== */}

  <div className={styles.propertyOverviewGrid}>
    {/* =============================================
        LEFT - IMAGE COLLAGE
    ============================================= */}

    <div className={styles.propertyGalleryPreview}>
      {loadingBuildingImages ? (
        <div className={styles.galleryPreviewFallback}>
          Loading images...
        </div>
      ) : buildingImages.length === 0 ? (
        <div className={styles.galleryPreviewFallback}>
          <Building2 size={42} />

          <span>
            No building images
          </span>
        </div>
      ) : (
        <>
          {/* =========================================
              MAIN LARGE IMAGE
          ========================================= */}

          <button
            type="button"
            className={styles.galleryPreviewMain}
            onClick={() =>
              openBuildingGallery(0)
            }
            aria-label="Open main property image"
          >
            {buildingImages[0]?.imageUrl && (
              <img
                src={
                  buildingImages[0]
                    .imageUrl!
                }
                alt={property.title}
                draggable={false}
              />
            )}

            <div className={styles.imageBadge}>
              <Building2 size={15} />

              Property for Rent
            </div>
          </button>

          {/* =========================================
              RIGHT TOP
          ========================================= */}

          {buildingImages[1]?.imageUrl ? (
            <button
              type="button"
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewTop}`}
              onClick={() =>
                openBuildingGallery(1)
              }
              aria-label="Open property image 2"
            >
              <img
                src={
                  buildingImages[1]
                    .imageUrl!
                }
                alt={`${property.title} 2`}
                draggable={false}
              />
            </button>
          ) : (
            <div
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewTop} ${styles.galleryPreviewEmpty}`}
            >
              <Building2 size={24} />
            </div>
          )}

          {/* =========================================
              RIGHT MIDDLE
          ========================================= */}

          {buildingImages[2]?.imageUrl ? (
            <button
              type="button"
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewMiddle}`}
              onClick={() =>
                openBuildingGallery(2)
              }
              aria-label="Open property image 3"
            >
              <img
                src={
                  buildingImages[2]
                    .imageUrl!
                }
                alt={`${property.title} 3`}
                draggable={false}
              />
            </button>
          ) : (
            <div
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewMiddle} ${styles.galleryPreviewEmpty}`}
            >
              <Building2 size={24} />
            </div>
          )}

          {/* =========================================
              RIGHT BOTTOM
          ========================================= */}

          {buildingImages[3]?.imageUrl ? (
            <button
              type="button"
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewBottom}`}
              onClick={() =>
                openBuildingGallery(3)
              }
              aria-label="Open property image 4"
            >
              <img
                src={
                  buildingImages[3]
                    .imageUrl!
                }
                alt={`${property.title} 4`}
                draggable={false}
              />

              {buildingImages.length > 4 && (
                <div
                  className={
                    styles.galleryPreviewMore
                  }
                >
                  <span>
                    +{buildingImages.length - 4}
                  </span>

                  <small>
                    More Photos
                  </small>
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.galleryPreviewSmall} ${styles.galleryPreviewBottom} ${styles.galleryPreviewEmpty}`}
              onClick={() =>
                openBuildingGallery(0)
              }
            >
              <Building2 size={24} />

              <span>
                View Photos
              </span>
            </button>
          )}

          {/* =========================================
              MOBILE / GENERAL PHOTO COUNT
          ========================================= */}

          <button
            type="button"
            className={
              styles.galleryPreviewPhotoCount
            }
            onClick={() =>
              openBuildingGallery(
                selectedImage
              )
            }
          >
            {buildingImages.length}{" "}
            {buildingImages.length === 1
              ? "Photo"
              : "Photos"}
          </button>
        </>
      )}
    </div>

    {/* =============================================
        RIGHT - PROPERTY DETAILS
    ============================================= */}

    <div className={styles.overviewDetails}>
      {/* TITLE */}

      <div className={styles.overviewTitle}>
        <span>
          Property Details
        </span>

        <h2>
          {property.title}
        </h2>

        <div className={styles.overviewLocation}>
          <MapPin size={17} />

          <span>
            {property.location}
          </span>
        </div>
      </div>

      {/* =========================================
          STATS
      ========================================= */}

      {/* <div className={styles.overviewStats}>
        <div className={styles.overviewStat}>
          <div className={styles.overviewStatIcon}>
            <Layers size={19} />
          </div>

          <div>
            <span>
              Vacant Units
            </span>

            <strong>
              {units.length}
            </strong>
          </div>
        </div>

        <div className={styles.overviewStat}>
          <div className={styles.overviewStatIcon}>
            <Grid2X2 size={19} />
          </div>

          <div>
            <span>
              Property Types
            </span>

            <strong>
              {propertyTypes.length}
            </strong>
          </div>
        </div>
      </div> */}

      {/* =========================================
          AVAILABLE PROPERTY TYPES
      ========================================= */}

      <div className={styles.overviewTypes}>
        <span className={styles.overviewTypesLabel}>
          Available Property Types
        </span>

        <div className={styles.overviewTypeList}>
          {propertyTypes.map(
            (type) => (
              <button
                key={type.name}
                type="button"
                onClick={() =>
                  navigateToPropertyType(
                    type.name
                  )
                }
                className={`${styles.overviewTypeChip} ${
                  selectedType ===
                  type.name
                    ? styles.overviewTypeChipActive
                    : ""
                }`}
              >
                <span>
                  {type.name}
                </span>

                <small>
                  {type.count}
                </small>

                <ChevronRight
                  size={13}
                  className={
                    styles.overviewTypeArrow
                  }
                />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  </div>
</section>

        {/* =================================================
            AMENITIES
        ================================================= */}

        <section
          className={
            styles.amenitiesSection
          }
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <h2>
              Building Amenities
            </h2>

            <p>
              Facilities and
              services available
              for this property.
            </p>
          </div>


          <div
            className={
              styles.amenitiesGrid
            }
          >
            {DUMMY_AMENITIES.map(
              (
                amenity
              ) => {
                const Icon =
                  amenity.icon;

                return (
                  <div
                    key={
                      amenity.label
                    }
                    className={
                      styles.amenityCard
                    }
                  >
                    <div
                      className={
                        styles.amenityIcon
                      }
                    >
                      <Icon
                        size={
                          18
                        }
                      />
                    </div>

                    <span>
                      {
                        amenity.label
                      }
                    </span>

                    <Check
                      size={
                        15
                      }
                      className={
                        styles.amenityCheck
                      }
                    />
                  </div>
                );
              }
            )}
          </div>
        </section>


        {/* =================================================
            AVAILABLE UNITS
        ================================================= */}

        <section
          ref={
            unitsSectionRef
          }
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
              Choose a property
              type below to view
              available units,
              annual rent, size
              and booking details.
            </p>
          </div>


          {/* PROPERTY TYPE TABS */}

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
                    navigateToPropertyType(
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
              SUMMARY
          ================================================= */}

          {selectedType && (
            <div
              className={
                styles.selectedTypeHeader
              }
            >
              <div
                className={
                  styles.selectedTypeTitle
                }
              >
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
                  styles.selectedTypeRight
                }
              >
                <div
                  className={
                    styles.selectedTypeStats
                  }
                >
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


                {/* VIEW SWITCH */}

                <div
                  className={
                    styles.viewSwitcher
                  }
                  role="group"
                  aria-label="Unit view"
                >
                  <button
                    type="button"
                    className={`${styles.viewButton} ${
                      unitView ===
                      "table"
                        ? styles.viewButtonActive
                        : ""
                    }`}
                    onClick={() =>
                      setUnitView(
                        "table"
                      )
                    }
                  >
                    <span
                      className={
                        styles.tableViewIcon
                      }
                    >
                      ▤
                    </span>

                    Table
                  </button>


                  <button
                    type="button"
                    className={`${styles.viewButton} ${
                      unitView ===
                      "card"
                        ? styles.viewButtonActive
                        : ""
                    }`}
                    onClick={() =>
                      setUnitView(
                        "card"
                      )
                    }
                  >
                    <Grid2X2
                      size={
                        14
                      }
                    />

                    Card
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* =================================================
              TABLE VIEW
          ================================================= */}

          {unitView ===
            "table" && (
            <div
              className={
                styles.unitTableScroll
              }
            >
              <div
                className={
                  styles.unitTableContent
                }
              >
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

                      {/* UNIT DETAILS */}

                      <div
                        className={
                          styles.unitMain
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.unitImageNameButton
                          }
                          onClick={() =>
                            openUnitImages(
                              unit
                            )
                          }
                        >
                          {unit.unitName ||
                            unit.propertyType}
                        </button>


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
                            size={
                              14
                            }
                          />

                          Available
                        </div>
                      </div>


                      {/* RENT */}

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
                        ) >
                          0 && (
                          <span>
                            per year
                          </span>
                        )}
                      </div>


                      {/* INFORMATION */}

                      <div
                        className={
                          styles.unitInformation
                        }
                      >
                        {Number(
                          unit.numberOfPayments ||
                            0
                        ) >
                          0 && (
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


                        <div
                          className={
                            styles.unitInfoItem
                          }
                        >
                          <span>
                            {Number(
                              unit.isWithBalcony
                            ) ===
                            1
                              ? "✓"
                              : "—"}
                          </span>

                          <span>
                            {Number(
                              unit.isWithBalcony
                            ) ===
                            1
                              ? "Balcony"
                              : "No Balcony"}
                          </span>
                        </div>


                        {unit.airConditioning && (
                          <div>
                            <Wind
                              size={
                                15
                              }
                            />

                            <span>
                              Air conditioning
                            </span>
                          </div>
                        )}
                      </div>


                      {/* ACTION */}

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
                            setBookingUnit(
                              unit
                            )
                          }
                        >
                          Book Now
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          )}


          {/* =================================================
              CARD VIEW
          ================================================= */}

          {unitView ===
            "card" && (
            <div
              className={
                styles.unitCardGrid
              }
            >
              {visibleUnits.map(
                (
                  unit,
                  index
                ) => (
                  <article
                    key={`${unit.referenceNo || selectedType}-card-${index}`}
                    className={
                      styles.unitCard
                    }
                  >
                    <div
                      className={
                        styles.unitCardHeader
                      }
                    >
                      <div>
                        <button
                          type="button"
                          className={
                            styles.unitCardImageNameButton
                          }
                          onClick={() =>
                            openUnitImages(
                              unit
                            )
                          }
                        >
                          {unit.unitName ||
                            unit.propertyType}
                        </button>


                        {unit.referenceNo && (
                          <span
                            className={
                              styles.unitCardReference
                            }
                          >
                            Ref:{" "}
                            {
                              unit.referenceNo
                            }
                          </span>
                        )}
                      </div>


                      <div
                        className={
                          styles.cardAvailable
                        }
                      >
                        <Check
                          size={
                            13
                          }
                        />

                        Available
                      </div>
                    </div>


                    <div
                      className={
                        styles.unitCardStats
                      }
                    >
                      <div
                        className={
                          styles.unitCardStat
                        }
                      >
                        <span>
                          Annual Rent
                        </span>

                        <strong>
                          {formatPrice(
                            unit.annualRent
                          )}
                        </strong>

                        {Number(
                          unit.annualRent ||
                            0
                        ) >
                          0 && (
                          <small>
                            per year
                          </small>
                        )}
                      </div>


                      <div
                        className={
                          styles.unitCardStat
                        }
                      >
                        <span>
                          Area
                        </span>

                        <strong>
                          {Number(
                            unit.area ||
                              0
                          ).toLocaleString()}{" "}
                          Sq.Ft.
                        </strong>
                      </div>


                      {unit.floorNumber !==
                        null &&
                        unit.floorNumber !==
                          undefined && (
                          <div
                            className={
                              styles.unitCardStat
                            }
                          >
                            <span>
                              Floor
                            </span>

                            <strong>
                              {
                                unit.floorNumber
                              }
                            </strong>
                          </div>
                        )}


                      {Number(
                        unit.numberOfPayments ||
                          0
                      ) >
                        0 && (
                        <div
                          className={
                            styles.unitCardStat
                          }
                        >
                          <span>
                            Payments
                          </span>

                          <strong>
                            {
                              unit.numberOfPayments
                            }
                          </strong>
                        </div>
                      )}
                    </div>


                    <div
                      className={
                        styles.unitCardInfo
                      }
                    >
                      <div>
                        <Check
                          size={
                            15
                          }
                        />

                        Vacant & available
                      </div>


                      {Number(
                        unit.isWithBalcony
                      ) ===
                      1 && (
                        <div>
                          <Check
                            size={
                              15
                            }
                          />

                          Balcony
                        </div>
                      )}


                      {unit.airConditioning && (
                        <div>
                          <Wind
                            size={
                              15
                            }
                          />

                          Air conditioning
                        </div>
                      )}
                    </div>


                    <button
                      type="button"
                      className={
                        styles.cardBookButton
                      }
                      onClick={() =>
                        setBookingUnit(
                          unit
                        )
                      }
                    >
                      Book Now
                    </button>
                  </article>
                )
              )}
            </div>
          )}


          {visibleUnits.length ===
            0 && (
            <div
              className={
                styles.noUnits
              }
            >
              No available units
              found.
            </div>
          )}
        </section>


        {/* =================================================
            FULL PROPERTY IMAGE GALLERY
        ================================================= */}

      {galleryOpen && buildingImages.length > 0 && (
  <div
    className={styles.propertyGalleryBackdrop}
    onClick={closeBuildingGallery}
  >
    <div
      className={styles.propertyGalleryModal}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={styles.propertyGalleryHeader}>
        <div className={styles.propertyGalleryHeaderLeft}>
          <button
            type="button"
            className={styles.propertyGalleryCategoryActive}
          >
            <Check size={16} />
            Property Images
          </button>
        </div>

        <button
          type="button"
          className={styles.propertyGalleryClose}
          onClick={closeBuildingGallery}
          aria-label="Close gallery"
        >
          ×
        </button>
      </div>

      <div className={styles.propertyGalleryTabs}>
        <button
          type="button"
          className={styles.propertyGalleryTabActive}
        >
          All Images({buildingImages.length})
        </button>

        {/* <button
          type="button"
          className={styles.propertyGalleryTab}
        >
          Property Views ({buildingImages.length})
        </button> */}
      </div>

      <div className={styles.propertyGalleryGrid}>
        {buildingImages.map((image, index) => {
          if (!image.imageUrl) return null;

          return (
            <button
              type="button"
              key={`property-gallery-${image.imageId}`}
              className={`${styles.propertyGalleryItem} ${
                galleryIndex === index
                  ? styles.propertyGalleryItemActive
                  : ""
              }`}
              onClick={() => {
                setGalleryIndex(index);
                setSelectedImage(index);
              }}
            >
              <img
                src={image.imageUrl}
                alt={`${property.title} ${index + 1}`}
                draggable={false}
              />

              <span className={styles.propertyGalleryNumber}>
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
)}


        {/* =================================================
            UNIT IMAGE MODAL
        ================================================= */}

        {selectedImageUnit && (
          <div
            className={
              styles.unitGalleryBackdrop
            }
            onClick={() =>
              setSelectedImageUnit(
                null
              )
            }
          >
            <div
              className={
                styles.unitGalleryModal
              }
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className={
                  styles.unitGalleryClose
                }
                onClick={() =>
                  setSelectedImageUnit(
                    null
                  )
                }
                aria-label="Close images"
              >
                ×
              </button>


              <div
                className={
                  styles.unitGalleryHeader
                }
              >
                <div>
                  <span>
                    Unit Images
                  </span>

                  <h3>
                    {selectedImageUnit.unitName ||
                      selectedImageUnit.propertyType}
                  </h3>
                </div>
              </div>


              {loadingUnitImages ? (
                <div
                  className={
                    styles.unitGalleryEmpty
                  }
                >
                  Loading images...
                </div>
              ) : unitImages.length ===
                0 ? (
                <div
                  className={
                    styles.unitGalleryEmpty
                  }
                >
                  <Building2
                    size={
                      35
                    }
                  />

                  <span>
                    No images uploaded
                    for this unit.
                  </span>
                </div>
              ) : (
                <>
                  <div
                    className={
                      styles.unitGalleryMain
                    }
                  >
                    {unitImages[
                      selectedUnitImageIndex
                    ]?.imageUrl && (
                      <img
                        src={
                          unitImages[
                            selectedUnitImageIndex
                          ].imageUrl!
                        }
                        alt={
                          selectedImageUnit.unitName ||
                          "Unit"
                        }
                      />
                    )}


                    {unitImages.length >
                      1 && (
                      <>
                        <button
                          type="button"
                          className={`${styles.unitGalleryArrow} ${styles.unitGalleryArrowLeft}`}
                          onClick={() =>
                            setSelectedUnitImageIndex(
                              (
                                current
                              ) =>
                                current ===
                                0
                                  ? unitImages.length -
                                    1
                                  : current -
                                    1
                            )
                          }
                          aria-label="Previous image"
                        >
                          ‹
                        </button>


                        <button
                          type="button"
                          className={`${styles.unitGalleryArrow} ${styles.unitGalleryArrowRight}`}
                          onClick={() =>
                            setSelectedUnitImageIndex(
                              (
                                current
                              ) =>
                                current ===
                                unitImages.length -
                                  1
                                  ? 0
                                  : current +
                                    1
                            )
                          }
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}


                    <span
                      className={
                        styles.unitGalleryCounter
                      }
                    >
                      {selectedUnitImageIndex +
                        1}
                      {" / "}
                      {
                        unitImages.length
                      }
                    </span>
                  </div>


                  {unitImages.length >
                    1 && (
                    <div
                      className={
                        styles.unitGalleryThumbs
                      }
                    >
                      {unitImages.map(
                        (
                          image,
                          index
                        ) => (
                          <button
                            type="button"
                            key={
                              image.imageId
                            }
                            onClick={() =>
                              setSelectedUnitImageIndex(
                                index
                              )
                            }
                            className={`${styles.unitGalleryThumb} ${
                              selectedUnitImageIndex ===
                              index
                                ? styles.unitGalleryThumbActive
                                : ""
                            }`}
                          >
                            {image.imageUrl && (
                              <img
                                src={
                                  image.imageUrl
                                }
                                alt=""
                              />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}


        {/* =================================================
            BOOKING MODAL
        ================================================= */}

        <BookingModal
          open={
            bookingUnit !==
            null
          }
          property={
            bookingUnit
              ? {
                  id:
                    property.id,

                  title:
                    property.title,

                  unitReference:
                    bookingUnit.referenceNo,

                  unitType:
                    bookingUnit.propertyType,
                }
              : null
          }
          onClose={() =>
            setBookingUnit(
              null
            )
          }
        />
      </div>
    </main>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <main
          className={
            styles.statePage
          }
        >
          <Building2
            size={
              40
            }
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
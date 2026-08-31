"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import { useSearchParams } from "next/navigation";
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
const API_URL =
  process.env.API_URL ||
  "http://localhost:5000";
/* =========================================================
   BUILDING IMAGES
========================================================= */
interface PropertyImage {
  imageId: number;

  imagePath: string;

  imageUrl:
    string | null;

  fileName:
    string | null;

  displayOrder: number;

  isPrimary: boolean;
}

/* =========================================================
   AMENITIES
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
   MAIN CONTENT
========================================================= */

function PropertyDetailContent() {
  const searchParams =
    useSearchParams();

  const buildingId =
    searchParams
      .get("id")
      ?.trim() || "";

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
    "table" | "card"
  >("table");

useEffect(() => {
  if (
    window.innerWidth <= 650
  ) {
    setUnitView(
      "card"
    );
  }
}, []);

const [
  buildingImages,
  setBuildingImages,
] = useState<
  PropertyImage[]
>([]);

const [
  loadingBuildingImages,
  setLoadingBuildingImages,
] = useState(false);
const [
  selectedImageUnit,
  setSelectedImageUnit,
] = useState<
  PropertyUnit | null
>(null);

const [
  unitImages,
  setUnitImages,
] = useState<
  PropertyImage[]
>([]);

const [
  loadingUnitImages,
  setLoadingUnitImages,
] = useState(false);

const [
  selectedUnitImageIndex,
  setSelectedUnitImageIndex,
] = useState(0);

  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  const [
    selectedType,
    setSelectedType,
  ] =
    useState("");

  /* =======================================================
     IMAGE
  ======================================================= */

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState(0);

  /* =======================================================
     REFS
  ======================================================= */
const openUnitImages =
  async (
    unit:
      PropertyUnit
  ) => {
    /*
     * Your API maps:
     *
     * dbo.unit.unit_desc
     *      ↓
     * unit.description
     */

    const unitDesc =
      String(
        unit.description ||
          ""
      ).trim();

    if (!unitDesc) {
      console.error(
        "unit_desc is missing:",
        unit
      );

      return;
    }

    setSelectedImageUnit(
      unit
    );

    setUnitImages([]);

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

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load unit images."
        );
      }

  const sortedImages: PropertyImage[] =
  Array.isArray(result.data)
    ? [...result.data].sort(
        (a, b) => {
          const orderA =
            Number(
              a.displayOrder
            ) || 999999;

          const orderB =
            Number(
              b.displayOrder
            ) || 999999;

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
    } catch (error) {
      console.error(
        "Unit image load failed:",
        error
      );

      setUnitImages([]);
    } finally {
      setLoadingUnitImages(
        false
      );
    }
  };

  const thumbnailRowRef =
  useRef<HTMLDivElement | null>(
    null
  );

  const unitsSectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const touchStartX =
    useRef<number | null>(
      null
    );

  const touchEndX =
    useRef<number | null>(
      null
    );
const handleThumbnailWheel = (
  event:
    React.WheelEvent<HTMLDivElement>
) => {
  const container =
    thumbnailRowRef.current;

  if (!container) {
    return;
  }

  const canScrollHorizontally =
    container.scrollWidth >
    container.clientWidth;

  if (!canScrollHorizontally) {
    return;
  }

  event.preventDefault();

  container.scrollBy({
    left:
      event.deltaY !== 0
        ? event.deltaY
        : event.deltaX,

    behavior:
      "smooth",
  });
};
  /* =======================================================
     IMAGE SWIPE
  ======================================================= */
async function loadBuildingImages(
  id: string
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

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Unable to load building images."
      );
    }

    setBuildingImages(
      Array.isArray(
        result.data
      )
        ? result.data
        : []
    );

    setSelectedImage(0);
  } catch (error) {
    console.error(
      "Building image load failed:",
      error
    );

    setBuildingImages([]);
  } finally {
    setLoadingBuildingImages(
      false
    );
  }
}
  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>
  ) => {
    touchEndX.current =
      null;

    touchStartX.current =
      event.targetTouches[0]
        .clientX;
  };

  const handleTouchMove = (
    event: TouchEvent<HTMLDivElement>
  ) => {
    touchEndX.current =
      event.targetTouches[0]
        .clientX;
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
        (current) =>
          current ===
          buildingImages.length -
            1
            ? 0
            : current + 1
      );
    }

    if (
      distance <
      -minimumSwipeDistance
    ) {
      setSelectedImage(
        (current) =>
          current === 0
            ? buildingImages.length -
              1
            : current - 1
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
      typeName: string
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
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    if (!buildingId) {
      setLoading(false);

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

    loadBuildingImages(
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
      } catch (error) {
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
        setLoading(false);
      }
    }

    loadPropertyData();
  }, [buildingId]);

  /* =======================================================
     PROPERTY TYPES
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
     DEFAULT PROPERTY TYPE
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
    }, [visibleUnits]);

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
        .split(",")
        .map((part) =>
          part.trim()
        )
        .filter(Boolean);
    }, [
      property?.location,
    ]);

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
          Loading
          property...
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
          Property
          unavailable
        </h1>

        <p>
          {error ||
            "Property not found"}
        </p>

        <Link
          href="/properties"
        >
          Back to
          Properties
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
                size={15}
              />

              <span>
                Home
              </span>
            </Link>

            <ChevronRight
              size={15}
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
              Properties
              for Rent
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
                    size={15}
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
                    {part}
                  </Link>
                </span>
              )
            )}

            <ChevronRight
              size={15}
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

        <section
          className={
            styles.gallerySection
          }
        >
          <div
            className={
              styles.sectionHeadingRow
            }
          >
            <div>
              <h2>
                Property
                Overview
              </h2>

              <p>
                View the
                building and
                key property
                information.
              </p>
            </div>

           {buildingImages.length >
  1 && (
  <span
    className={
      styles.photoCount
    }
  >
    {
      buildingImages.length
    }{" "}
    Photos
  </span>
)}
          </div>

          <div
            className={
              styles.propertyOverviewGrid
            }
          >
            {/* IMAGE */}

           <div
  className={
    styles.buildingImageArea
  }
  onTouchStart={
    handleTouchStart
  }
  onTouchMove={
    handleTouchMove
  }
  onTouchEnd={
    handleTouchEnd
  }
>
  {loadingBuildingImages ? (
    <div
      className={
        styles.galleryFallback
      }
    >
      Loading images...
    </div>
  ) : buildingImages.length >
    0 &&
    buildingImages[
      selectedImage
    ]?.imageUrl ? (
    <img
      src={
        buildingImages[
          selectedImage
        ].imageUrl!
      }
      alt={
        property.title
      }
      className={
        styles.buildingMainImage
      }
      draggable={
        false
      }
    />
  ) : (
    <div
      className={
        styles.galleryFallback
      }
    >
      <Building2
        size={42}
      />

      <span>
        No building images
      </span>
    </div>
  )}

  <div
    className={
      styles.imageBadge
    }
  >
    <Building2
      size={15}
    />

    Property for Rent
  </div>

  {buildingImages.length >
    1 && (
    <div
      className={
        styles.imageCounter
      }
    >
      {selectedImage +
        1}{" "}
      /{" "}
      {
        buildingImages.length
      }
    </div>
  )}
</div>

            {/* THUMBNAILS */}

           {buildingImages.length >
  1 && (
  <div
    ref={
      thumbnailRowRef
    }

    className={
      styles.thumbnailRow
    }

    onWheel={
      handleThumbnailWheel
    }
  >
    {buildingImages.map(
      (
        image,
        index
      ) => (
        <button
          key={
            image.imageId
          }

          type="button"

          onClick={() =>
            setSelectedImage(
              index
            )
          }

          className={`${styles.thumbButton} ${
            selectedImage ===
            index
              ? styles.thumbActive
              : ""
          }`}
        >
          {image.imageUrl && (
            <img
              src={
                image.imageUrl
              }

              alt={`${property.title} ${
                index + 1
              }`}

              className={
                styles.thumbImage
              }

              draggable={
                false
              }
            />
          )}
        </button>
      )
    )}
  </div>
)}

            {/* PROPERTY DETAILS */}

            <div
              className={
                styles.overviewDetails
              }
            >
              <div
                className={
                  styles.overviewTitle
                }
              >
                <span>
                  Property
                  Details
                </span>

                <h2>
                  {
                    property.title
                  }
                </h2>

                <div
                  className={
                    styles.overviewLocation
                  }
                >
                  <MapPin
                    size={
                      17
                    }
                  />

                  <span>
                    {
                      property.location
                    }
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.overviewStats
                }
              >
              

                <div
                  className={
                    styles.overviewStat
                  }
                >
                  <div
                    className={
                      styles.overviewStatIcon
                    }
                  >
                    <Layers
                      size={
                        19
                      }
                    />
                  </div>

                  <div>
                    <span>
                      Vacant
                      Units
                    </span>

                    <strong>
                      {
                        units.length
                      }
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    styles.overviewStat
                  }
                >
                  <div
                    className={
                      styles.overviewStatIcon
                    }
                  >
                    <Grid2X2
                      size={
                        19
                      }
                    />
                  </div>

                  <div>
                    <span>
                      Property
                      Types
                    </span>

                    <strong>
                      {
                        propertyTypes.length
                      }
                    </strong>
                  </div>
                </div>
              </div>

              {/* TYPES */}

              <div
                className={
                  styles.overviewTypes
                }
              >
                <span
                  className={
                    styles.overviewTypesLabel
                  }
                >
                  Available
                  Property
                  Types
                </span>

                <div
                  className={
                    styles.overviewTypeList
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
                        className={`${styles.overviewTypeChip} ${
                          selectedType ===
                          type.name
                            ? styles.overviewTypeChipActive
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

                        <ChevronRight
                          size={
                            13
                          }
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
              Building
              Amenities
            </h2>

            <p>
              Facilities and
              services
              available for
              this property.
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
              Available
              Units
            </h2>

            <p>
              Choose a
              property type
              below to view
              available units,
              annual rent,
              size and booking
              details.
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
              SUMMARY + VIEW SWITCH
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
                      Annual
                      Rent
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

                {/* VIEW SWITCHER */}

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
                    Unit
                    Information
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
                            <Wind
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
                          Annual
                          Rent
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

                        Vacant &
                        available
                      </div>

                      {unit.airConditioning && (
                        <div>
                          <Wind
                            size={
                              15
                            }
                          />

                          Air
                          conditioning
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
              No available
              units found.
            </div>
          )}
        </section>

        {/* =================================================
            BOOKING MODAL
        ================================================= */}
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
            size={35}
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
                1}{" "}
              /{" "}
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
            size={40}
          />

          <h2>
            Loading
            property...
          </h2>
        </main>
      }
    >
      <PropertyDetailContent />
    </Suspense>
  );
}
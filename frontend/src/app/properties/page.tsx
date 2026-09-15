"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useSearchParams,
} from "next/navigation";

import {
  MapPin,
  Building2,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  Home,
} from "lucide-react";

import {
  getProperties,
  getPropertyFilterOptions,
  getPropertyBuildingUnitOptions,
  type Property,
  type PropertyFilterCategory,
  type PropertyBuildingOption,
  type PropertyUnitOption,
} from "@/lib/propertyApi";

import {
  savePropertyFilters,
  getSavedPropertyFilters,
  clearSavedPropertyFilters,
  
} from "@/lib/propertyFilterStorage";

import styles from "./properties.module.css";


const PAGE_SIZE =
  10;


/* =========================================================
   BED OPTIONS
========================================================= */

const BED_OPTIONS = [
  {
    value: "All",
    label: "Any",
  },
  {
    value: "STD",
    label: "Studio",
  },
  {
    value: "1BK",
    label: "1 Bed",
  },
  {
    value: "2BK",
    label: "2 Beds",
  },
  {
    value: "3BK",
    label: "3 Beds",
  },
  {
    value: "4BK",
    label: "4 Beds",
  },
];


/* =========================================================
   PRICE OPTIONS
========================================================= */

const PRICE_OPTIONS = [
  {
    value: "All",
    label: "Any Price",
  },
  {
    value: "0-30000",
    label: "Up to AED 30,000",
  },
  {
    value: "30000-50000",
    label: "AED 30,000 - 50,000",
  },
  {
    value: "50000-100000",
    label: "AED 50,000 - 100,000",
  },
  {
    value: "100000-200000",
    label: "AED 100,000 - 200,000",
  },
  {
    value: "200000-",
    label: "AED 200,000+",
  },
];


/* =========================================================
   AREA OPTIONS
========================================================= */

const AREA_OPTIONS = [
  {
    value: "All",
    label: "Any Size",
  },
  {
    value: "0-500",
    label: "Up to 500 Sq.Ft.",
  },
  {
    value: "500-1000",
    label: "500 - 1,000 Sq.Ft.",
  },
  {
    value: "1000-2000",
    label: "1,000 - 2,000 Sq.Ft.",
  },
  {
    value: "2000-5000",
    label: "2,000 - 5,000 Sq.Ft.",
  },
  {
    value: "5000-",
    label: "5,000+ Sq.Ft.",
  },
];


/* =========================================================
   BUILD RANGE VALUE
========================================================= */

function buildRangeValue(
  minValue: string | null,
  maxValue: string | null
) {
  const min =
    minValue?.trim() || "";

  const max =
    maxValue?.trim() || "";

  if (
    !min &&
    !max
  ) {
    return "All";
  }

  return `${min}-${max}`;
}


/* =========================================================
   IMAGE GALLERY
========================================================= */

function ListingImageGallery({
  property,
}: {
  property: Property;
}) {
  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(0);


  const images =
    useMemo(() => {
      const gallery =
        Array.isArray(
          property.galleryImages
        )
          ? property.galleryImages
          : [];

      const validImages =
        gallery.filter(
          (
            image
          ) =>
            Boolean(
              image.imageUrl
            )
        );

      if (
        validImages.length >
        0
      ) {
        return validImages;
      }


      if (
        property.primaryImageUrl
      ) {
        return [
          {
            imageId: -1,

            imagePath:
              property.primaryImagePath ||
              "",

            imageUrl:
              property.primaryImageUrl,

            imageType:
              "BUILDING" as const,

            displayOrder: 0,
          },
        ];
      }

      return [];
    }, [
      property.galleryImages,
      property.primaryImagePath,
      property.primaryImageUrl,
    ]);


  useEffect(() => {
    setActiveIndex(
      0
    );
  }, [
    property.listingId,
  ]);


  const previousImage =
    (
      event:
        React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        images.length <=
        1
      ) {
        return;
      }

      setActiveIndex(
        (
          current
        ) =>
          current === 0
            ? images.length -
              1
            : current -
              1
      );
    };


  const nextImage =
    (
      event:
        React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        images.length <=
        1
      ) {
        return;
      }

      setActiveIndex(
        (
          current
        ) =>
          current ===
          images.length - 1
            ? 0
            : current + 1
      );
    };


  if (
    images.length ===
    0
  ) {
    return (
      <div
        className={
          styles.galleryPreviewFallback
        }
      >
        <h3
          className={
            styles.galleryPreviewFallbackTitle
          }
        >
          No Property Images
        </h3>

        <p
          className={
            styles.galleryPreviewFallbackText
          }
        >
          Images for this property
          are not available yet.
        </p>
      </div>
    );
  }


  const currentImage =
    images[
      activeIndex
    ];


  return (
    <div
      className={
        styles.listingGallery
      }
    >
      <img
        src={
          currentImage.imageUrl!
        }
        alt={
          property.title
        }
        className={
          styles.listingGalleryImage
        }
      />


      <span
        className={
          styles.listingImageType
        }
      >
        {currentImage.imageType ===
        "UNIT"
          ? "Unit"
          : "Building"}
      </span>


      {images.length >
        1 && (
        <>
          <button
            type="button"
            className={`${styles.listingGalleryArrow} ${styles.listingGalleryPrevious}`}
            onClick={
              previousImage
            }
            aria-label="Previous image"
          >
            <ChevronLeft
              size={22}
            />
          </button>


          <button
            type="button"
            className={`${styles.listingGalleryArrow} ${styles.listingGalleryNext}`}
            onClick={
              nextImage
            }
            aria-label="Next image"
          >
            <ChevronRight
              size={22}
            />
          </button>


          <span
            className={
              styles.listingGalleryCounter
            }
          >
            {activeIndex + 1}
            /
            {images.length}
          </span>
        </>
      )}
    </div>
  );
}


/* =========================================================
   PROPERTIES CONTENT
========================================================= */

function PropertiesContent() {
  const searchParams =
    useSearchParams();


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  const [
    filtersInitialized,
    setFiltersInitialized,
  ] =
    useState(false);


  /* =======================================================
     BUILDING
  ======================================================= */

  const [
    buildingId,
    setBuildingId,
  ] =
    useState("");

  const [
    buildingOptions,
    setBuildingOptions,
  ] =
    useState<
      PropertyBuildingOption[]
    >([]);


  /* =======================================================
     UNIT
  ======================================================= */

  const [
    unitDesc,
    setUnitDesc,
  ] =
    useState("");

  const [
    unitOptions,
    setUnitOptions,
  ] =
    useState<
      PropertyUnitOption[]
    >([]);


  /* =======================================================
     RESULTS
  ======================================================= */

  const [
    properties,
    setProperties,
  ] =
    useState<
      Property[]
    >([]);

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


  /* =======================================================
     PAGINATION
  ======================================================= */

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    pagination,
    setPagination,
  ] =
    useState({
      page: 1,

      pageSize:
        PAGE_SIZE,

      totalRecords:
        0,

      totalPages:
        0,
    });


  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const [
    propertyCategories,
    setPropertyCategories,
  ] =
    useState<
      PropertyFilterCategory[]
    >([]);

  const [
    loadingFilterOptions,
    setLoadingFilterOptions,
  ] =
    useState(true);


  /* =======================================================
     LOCATION
  ======================================================= */

  const [
    locationInput,
    setLocationInput,
  ] =
    useState("");

  const [
    location,
    setLocation,
  ] =
    useState("");


  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  const [
    unitTypeId,
    setUnitTypeId,
  ] =
    useState<
      number | null
    >(null);


  /* =======================================================
     BEDS
  ======================================================= */

  const [
    beds,
    setBeds,
  ] =
    useState("All");


  /* =======================================================
     PRICE
  ======================================================= */

  const [
    priceRange,
    setPriceRange,
  ] =
    useState("All");


  /* =======================================================
     AREA
  ======================================================= */

  const [
    areaRange,
    setAreaRange,
  ] =
    useState("All");


  /* =======================================================
     MOBILE FILTER
  ======================================================= */

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] =
    useState(false);


  /* =======================================================
     INITIAL RESTORE

     Priority:
     1. Existing session filters
     2. URL filters
     3. Defaults
  ======================================================= */

  useEffect(() => {
    const saved =
      getSavedPropertyFilters();


    /* =====================================================
       RESTORE SESSION
    ===================================================== */

    if (
      saved
    ) {
      setLocationInput(
        saved.location ||
          ""
      );

      setLocation(
        saved.location ||
          ""
      );

      setUnitTypeId(
        saved.unitTypeId ??
          null
      );

      setBeds(
        saved.beds ||
          "All"
      );

      setAreaRange(
        saved.areaRange ||
          "All"
      );

      setPriceRange(
        saved.priceRange ||
          "All"
      );

      setBuildingId(
        saved.buildingId ||
          ""
      );

      setUnitDesc(
        saved.unitDesc ||
          ""
      );

      setPage(
        saved.page &&
        saved.page > 0
          ? saved.page
          : 1
      );

      setFiltersInitialized(
        true
      );

      return;
    }


    /* =====================================================
       LOAD URL FILTERS
    ===================================================== */

    const search =
      searchParams.get(
        "search"
      ) || "";

    setLocationInput(
      search
    );

    setLocation(
      search
    );


    setBuildingId(
      searchParams.get(
        "buildingId"
      ) || ""
    );


    setUnitDesc(
      searchParams.get(
        "unitDesc"
      ) || ""
    );


    /* PROPERTY TYPE */

    const unitTypeParam =
      searchParams.get(
        "unitTypeId"
      );

    if (
      unitTypeParam &&
      Number.isFinite(
        Number(
          unitTypeParam
        )
      )
    ) {
      setUnitTypeId(
        Number(
          unitTypeParam
        )
      );
    } else {
      setUnitTypeId(
        null
      );
    }


    /* BEDS */

    const bedsParam =
      searchParams.get(
        "beds"
      );

    const validBed =
      BED_OPTIONS.some(
        (
          option
        ) =>
          option.value ===
          bedsParam
      );

    setBeds(
      bedsParam &&
        validBed
        ? bedsParam
        : "All"
    );


    /* PRICE */

    const urlPriceRange =
      buildRangeValue(
        searchParams.get(
          "minPrice"
        ),
        searchParams.get(
          "maxPrice"
        )
      );

    const validPriceRange =
      PRICE_OPTIONS.some(
        (
          option
        ) =>
          option.value ===
          urlPriceRange
      );

    setPriceRange(
      validPriceRange
        ? urlPriceRange
        : "All"
    );


    /* AREA */

    const urlAreaRange =
      buildRangeValue(
        searchParams.get(
          "minArea"
        ),
        searchParams.get(
          "maxArea"
        )
      );

    const validAreaRange =
      AREA_OPTIONS.some(
        (
          option
        ) =>
          option.value ===
          urlAreaRange
      );

    setAreaRange(
      validAreaRange
        ? urlAreaRange
        : "All"
    );


    /* PAGE */

    const pageParam =
      Number(
        searchParams.get(
          "page"
        ) || 1
      );

    setPage(
      Number.isFinite(
        pageParam
      ) &&
        pageParam > 0
        ? pageParam
        : 1
    );


    setFiltersInitialized(
      true
    );
  }, [
    searchParams,
  ]);


  /* =======================================================
     SAVE FILTERS
  ======================================================= */

  useEffect(() => {
    if (
      !filtersInitialized
    ) {
      return;
    }


    const isDefault =
      !location &&
      !buildingId &&
      !unitDesc &&
      unitTypeId ===
        null &&
      beds ===
        "All" &&
      areaRange ===
        "All" &&
      priceRange ===
        "All" &&
      page ===
        1;


    if (
      isDefault
    ) {
      clearSavedPropertyFilters();

      return;
    }


    savePropertyFilters({
      location,

      unitTypeId,

      beds,

      areaRange,

      priceRange,

      buildingId,

      unitDesc,

      page,
    });
  }, [
    filtersInitialized,
    location,
    buildingId,
    unitDesc,
    unitTypeId,
    beds,
    areaRange,
    priceRange,
    page,
  ]);


  /* =======================================================
     LOAD PROPERTY TYPE OPTIONS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;


    async function loadFilterOptions() {
      try {
        setLoadingFilterOptions(
          true
        );

        const data =
          await getPropertyFilterOptions();


        if (
          cancelled
        ) {
          return;
        }


        setPropertyCategories(
          Array.isArray(
            data
          )
            ? data
            : []
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to load property filter options:",
          error
        );


        if (
          !cancelled
        ) {
          setPropertyCategories(
            []
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoadingFilterOptions(
            false
          );
        }
      }
    }


    loadFilterOptions();


    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =======================================================
     LOAD BUILDINGS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;


    async function loadBuildings() {
      try {
        const result =
          await getPropertyBuildingUnitOptions();


        if (
          cancelled
        ) {
          return;
        }


        setBuildingOptions(
          result.buildings ||
            []
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to load buildings:",
          error
        );


        if (
          !cancelled
        ) {
          setBuildingOptions(
            []
          );
        }
      }
    }


    loadBuildings();


    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =======================================================
     LOAD UNITS FOR BUILDING
  ======================================================= */

  useEffect(() => {
    if (
      !filtersInitialized
    ) {
      return;
    }


    if (
      !buildingId
    ) {
      setUnitOptions(
        []
      );

      setUnitDesc(
        ""
      );

      return;
    }


    let cancelled =
      false;


    async function loadUnits() {
      try {
        const result =
          await getPropertyBuildingUnitOptions(
            buildingId
          );


        if (
          cancelled
        ) {
          return;
        }


        const units =
          result.units ||
          [];


        setUnitOptions(
          units
        );


        /*
         * Keep restored unit only
         * when it still belongs to
         * selected building.
         */
        setUnitDesc(
          (
            current
          ) => {
            if (
              !current
            ) {
              return "";
            }


            const exists =
              units.some(
                (
                  unit
                ) =>
                  unit.unitDesc ===
                  current
              );


            return exists
              ? current
              : "";
          }
        );
      } catch (
        error
      ) {
        console.error(
          "Unable to load units:",
          error
        );


        if (
          !cancelled
        ) {
          setUnitOptions(
            []
          );
        }
      }
    }


    loadUnits();


    return () => {
      cancelled =
        true;
    };
  }, [
    buildingId,
    filtersInitialized,
  ]);


  /* =======================================================
     LOCATION DEBOUNCE
  ======================================================= */

  useEffect(() => {
    if (
      !filtersInitialized
    ) {
      return;
    }


    const timer =
      window.setTimeout(
        () => {
          const value =
            locationInput.trim();


          setLocation(
            (
              current
            ) => {
              if (
                current !==
                value
              ) {
                setPage(
                  1
                );
              }

              return value;
            }
          );
        },
        400
      );


    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    locationInput,
    filtersInitialized,
  ]);


  /* =======================================================
     SELECTED PROPERTY TYPE
  ======================================================= */

  const selectedUnitType =
    useMemo(() => {
      for (
        const category of
        propertyCategories
      ) {
        const found =
          category.types.find(
            (
              type
            ) =>
              type.id ===
              unitTypeId
          );


        if (
          found
        ) {
          return found;
        }
      }


      return null;
    }, [
      propertyCategories,
      unitTypeId,
    ]);


  /* =======================================================
     APARTMENT
  ======================================================= */

  const isApartment =
    selectedUnitType
      ?.name
      ?.trim()
      .toUpperCase() ===
    "APARTMENT";


  /* =======================================================
     FORMAT CATEGORY
  ======================================================= */

  function formatCategoryName(
    value: string
  ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /\b\w/g,
        (
          char
        ) =>
          char.toUpperCase()
      );
  }


  /* =======================================================
     FORMAT TYPE
  ======================================================= */

  function formatUnitType(
    value: string
  ) {
    const mapping:
      Record<
        string,
        string
      > = {
      APARTMENT:
        "Apartment",

      VILLA:
        "Villa",

      OFFICE:
        "Office",

      SHOP:
        "Shop",

      "LABOUR CAMP":
        "Labour Camp",

      "SHOW ROOM":
        "Showroom",

      SHOWROOM:
        "Showroom",

      WAREHOUSE:
        "Warehouse",

      STORE:
        "Store",
    };


    const key =
      value
        .trim()
        .toUpperCase();


    return (
      mapping[
        key
      ] ||
      formatCategoryName(
        value
      )
    );
  }


  /* =======================================================
     BREADCRUMB VALUES
  ======================================================= */

  const selectedCategoryName =
    useMemo(() => {
      if (
        !unitTypeId
      ) {
        return null;
      }


      for (
        const category of
        propertyCategories
      ) {
        const exists =
          category.types.some(
            (
              type
            ) =>
              type.id ===
              unitTypeId
          );


        if (
          exists
        ) {
          return formatCategoryName(
            category.categoryName
          );
        }
      }


      return null;
    }, [
      propertyCategories,
      unitTypeId,
    ]);


  const selectedPropertyTypeName =
    selectedUnitType
      ? formatUnitType(
          selectedUnitType.name
        )
      : null;


  const selectedBedName =
    beds !== "All"
      ? BED_OPTIONS.find(
          (
            option
          ) =>
            option.value ===
            beds
        )?.label ||
        null
      : null;


  /* =======================================================
     LOAD PROPERTIES
  ======================================================= */

  useEffect(() => {
    if (
      !filtersInitialized
    ) {
      return;
    }


    let cancelled =
      false;


    async function loadProperties() {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );


        /* PRICE */

        let minPrice:
          string | undefined;

        let maxPrice:
          string | undefined;


        if (
          priceRange !==
          "All"
        ) {
          const [
            min,
            max,
          ] =
            priceRange.split(
              "-"
            );


          minPrice =
            min ||
            undefined;

          maxPrice =
            max ||
            undefined;
        }


        /* AREA */

        let minArea:
          string | undefined;

        let maxArea:
          string | undefined;


        if (
          areaRange !==
          "All"
        ) {
          const [
            min,
            max,
          ] =
            areaRange.split(
              "-"
            );


          minArea =
            min ||
            undefined;

          maxArea =
            max ||
            undefined;
        }


        const result =
          await getProperties({
            page,

            pageSize:
              PAGE_SIZE,

            view:
              "unitType",

            search:
              location ||
              undefined,

            buildingId:
              buildingId ||
              undefined,

            unitDesc:
              unitDesc ||
              undefined,

            unitTypeId:
              unitTypeId ??
              undefined,

            beds:
              isApartment &&
              beds !==
                "All"
                ? beds
                : undefined,

            minPrice,

            maxPrice,

            minArea,

            maxArea,
          });


        if (
          cancelled
        ) {
          return;
        }


        setProperties(
          Array.isArray(
            result.properties
          )
            ? result.properties
            : []
        );


        setPagination(
          result.pagination
        );
      } catch (
        error
      ) {
        if (
          cancelled
        ) {
          return;
        }


        console.error(
          "Unable to load properties:",
          error
        );


        setProperties(
          []
        );


        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load properties."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }


    loadProperties();


    return () => {
      cancelled =
        true;
    };
  }, [
    filtersInitialized,
    page,
    buildingId,
    unitDesc,
    location,
    unitTypeId,
    beds,
    priceRange,
    areaRange,
    isApartment,
  ]);


  /* =======================================================
     PROPERTY TYPE CHANGE
  ======================================================= */

  const updatePropertyType =
    (
      id:
        number | null
    ) => {
      setUnitTypeId(
        id
      );

      setBeds(
        "All"
      );

      setPage(
        1
      );
    };


  /* =======================================================
     PRICE CHANGE
  ======================================================= */

  const updatePriceRange =
    (
      value:
        string
    ) => {
      setPriceRange(
        value
      );

      setPage(
        1
      );
    };


  /* =======================================================
     AREA CHANGE
  ======================================================= */

  const updateAreaRange =
    (
      value:
        string
    ) => {
      setAreaRange(
        value
      );

      setPage(
        1
      );
    };


  /* =======================================================
     BEDS CHANGE
  ======================================================= */

  const updateBeds =
    (
      value:
        string
    ) => {
      setBeds(
        value
      );

      setPage(
        1
      );
    };


  /* =======================================================
     CLEAR
  ======================================================= */

  const clearFilters =
    () => {
      clearSavedPropertyFilters();


      setLocationInput(
        ""
      );

      setLocation(
        ""
      );

      setBuildingId(
        ""
      );

      setUnitDesc(
        ""
      );

      setUnitOptions(
        []
      );

      setUnitTypeId(
        null
      );

      setBeds(
        "All"
      );

      setPriceRange(
        "All"
      );

      setAreaRange(
        "All"
      );

      setPage(
        1
      );
    };


  /* =======================================================
     PRICE FORMAT
  ======================================================= */

  const formatPrice =
    (
      price:
        number
    ) => {
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
        price
      );
    };


  /* =======================================================
     JSX
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
            styles.breadcrumbContainer
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
                size={14}
              />

              <span>
                Home
              </span>
            </Link>


            <ChevronRight
              size={14}
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


            {location && (
              <>
                <ChevronRight
                  size={14}
                  className={
                    styles.breadcrumbArrow
                  }
                />

                <span
                  className={
                    styles.breadcrumbText
                  }
                >
                  {location}
                </span>
              </>
            )}


            {selectedCategoryName && (
              <>
                <ChevronRight
                  size={14}
                  className={
                    styles.breadcrumbArrow
                  }
                />

                <span
                  className={
                    styles.breadcrumbText
                  }
                >
                  {
                    selectedCategoryName
                  }
                </span>
              </>
            )}


            {selectedPropertyTypeName && (
              <>
                <ChevronRight
                  size={14}
                  className={
                    styles.breadcrumbArrow
                  }
                />

                <span
                  className={
                    styles.breadcrumbText
                  }
                >
                  {
                    selectedPropertyTypeName
                  }
                </span>
              </>
            )}


            {selectedBedName && (
              <>
                <ChevronRight
                  size={14}
                  className={
                    styles.breadcrumbArrow
                  }
                />

                <span
                  className={
                    styles.breadcrumbCurrent
                  }
                >
                  {
                    selectedBedName
                  }
                </span>
              </>
            )}


            {!location &&
              !selectedPropertyTypeName &&
              !selectedBedName && (
              <>
                <ChevronRight
                  size={14}
                  className={
                    styles.breadcrumbArrow
                  }
                />

                <span
                  className={
                    styles.breadcrumbCurrent
                  }
                >
                  Search Results
                </span>
              </>
            )}
          </nav>
        </div>
      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <section
        className={
          styles.container
        }
      >
        {/* RESULTS COUNT */}

        <div
          className={
            styles.resultsCountRow
          }
        >
          {!loading &&
            !error && (
            <div
              className={
                styles.resultsCountText
              }
            >
              <strong>
                {pagination
                  .totalRecords
                  .toLocaleString(
                    "en-AE"
                  )}
              </strong>

              <span>
                Rental{" "}
                {pagination.totalRecords ===
                1
                  ? "Property"
                  : "Properties"}
              </span>
            </div>
          )}
        </div>


        {/* MOBILE FILTER */}

        <button
          type="button"
          className={
            styles.mobileFilterButton
          }
          onClick={() =>
            setMobileFiltersOpen(
              (
                current
              ) =>
                !current
            )
          }
        >
          Filter Properties
        </button>


        <div
          className={
            styles.resultsLayout
          }
        >
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className={`${styles.filterSidebar} ${
              mobileFiltersOpen
                ? styles.filterSidebarOpen
                : ""
            }`}
          >
            {/* HEADER */}

            <div
              className={
                styles.filterHeader
              }
            >
              <h2>
                Filter by:
              </h2>

              <button
                type="button"
                className={
                  styles.clearFilters
                }
                onClick={
                  clearFilters
                }
              >
                <RotateCcw
                  size={13}
                />

                Clear
              </button>
            </div>


            {/* LOCATION */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Location
              </h3>

              <div
                className={
                  styles.locationFilterWrapper
                }
              >
                <Search
                  size={15}
                />

                <input
                  type="text"
                  value={
                    locationInput
                  }
                  onChange={(
                    event
                  ) =>
                    setLocationInput(
                      event.target.value
                    )
                  }
                  placeholder="Area or community"
                  className={
                    styles.locationFilter
                  }
                />
              </div>
            </div>


            {/* BUILDING */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Building
              </h3>

              <select
                value={
                  buildingId
                }
                onChange={(
                  event
                ) => {
                  const value =
                    event.target.value;

                  setBuildingId(
                    value
                  );

                  setUnitDesc(
                    ""
                  );

                  setUnitOptions(
                    []
                  );

                  setPage(
                    1
                  );
                }}
                className={
                  styles.filterSelect
                }
              >
                <option value="">
                  All Buildings
                </option>

                {buildingOptions.map(
                  (
                    building
                  ) => (
                    <option
                      key={
                        building.buildingId
                      }
                      value={
                        building.buildingId
                      }
                    >
                      {
                        building.buildingName
                      }
                    </option>
                  )
                )}
              </select>
            </div>


            {/* UNIT */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Unit
              </h3>

              <select
                value={
                  unitDesc
                }
                disabled={
                  !buildingId
                }
                onChange={(
                  event
                ) => {
                  setUnitDesc(
                    event.target.value
                  );

                  setPage(
                    1
                  );
                }}
                className={
                  styles.filterSelect
                }
              >
                <option value="">
                  {buildingId
                    ? "All Units"
                    : "Select building first"}
                </option>

                {unitOptions.map(
                  (
                    unit
                  ) => (
                    <option
                      key={
                        unit.unitDesc
                      }
                      value={
                        unit.unitDesc
                      }
                    >
                      Unit{" "}
                      {
                        unit.unitDesc
                      }

                      {unit.unitType
                        ? ` - ${unit.unitType}`
                        : ""}

                      {unit.annualRent
                        ? ` - AED ${Number(
                            unit.annualRent
                          ).toLocaleString(
                            "en-AE"
                          )}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>


            {/* PROPERTY TYPE */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Property Type
              </h3>


              <label
                className={
                  styles.checkOption
                }
              >
                <input
                  type="radio"
                  name="propertyType"
                  checked={
                    unitTypeId ===
                    null
                  }
                  onChange={() =>
                    updatePropertyType(
                      null
                    )
                  }
                />

                <span
                  className={
                    styles.fakeCheckbox
                  }
                />

                <span
                  className={
                    styles.checkLabel
                  }
                >
                  All Properties
                </span>
              </label>


              {loadingFilterOptions ? (
                <div
                  className={
                    styles.filterLoading
                  }
                >
                  Loading...
                </div>
              ) : (
                propertyCategories.map(
                  (
                    category
                  ) => (
                    <div
                      key={
                        category.categoryId
                      }
                      className={
                        styles.propertyCategoryGroup
                      }
                    >
                      <div
                        className={
                          styles.propertyCategoryTitle
                        }
                      >
                        {formatCategoryName(
                          category.categoryName
                        )}
                      </div>


                      {category.types.map(
                        (
                          type
                        ) => (
                          <label
                            key={
                              type.id
                            }
                            className={
                              styles.checkOption
                            }
                          >
                            <input
                              type="radio"
                              name="propertyType"
                              checked={
                                unitTypeId ===
                                type.id
                              }
                              onChange={() =>
                                updatePropertyType(
                                  type.id
                                )
                              }
                            />

                            <span
                              className={
                                styles.fakeCheckbox
                              }
                            />

                            <span
                              className={
                                styles.checkLabel
                              }
                            >
                              {formatUnitType(
                                type.name
                              )}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  )
                )
              )}
            </div>


            {/* BEDS */}

            {isApartment && (
              <div
                className={
                  styles.filterSection
                }
              >
                <h3>
                  Beds
                </h3>


                {BED_OPTIONS.map(
                  (
                    option
                  ) => (
                    <label
                      key={
                        option.value
                      }
                      className={
                        styles.checkOption
                      }
                    >
                      <input
                        type="radio"
                        name="beds"
                        checked={
                          beds ===
                          option.value
                        }
                        onChange={() =>
                          updateBeds(
                            option.value
                          )
                        }
                      />

                      <span
                        className={
                          styles.fakeCheckbox
                        }
                      />

                      <span
                        className={
                          styles.checkLabel
                        }
                      >
                        {
                          option.label
                        }
                      </span>
                    </label>
                  )
                )}
              </div>
            )}


            {/* AREA */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Area
              </h3>


              {AREA_OPTIONS.map(
                (
                  option
                ) => (
                  <label
                    key={
                      option.value
                    }
                    className={
                      styles.checkOption
                    }
                  >
                    <input
                      type="radio"
                      name="areaRange"
                      checked={
                        areaRange ===
                        option.value
                      }
                      onChange={() =>
                        updateAreaRange(
                          option.value
                        )
                      }
                    />

                    <span
                      className={
                        styles.fakeCheckbox
                      }
                    />

                    <span
                      className={
                        styles.checkLabel
                      }
                    >
                      {
                        option.label
                      }
                    </span>
                  </label>
                )
              )}
            </div>


            {/* PRICE */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Annual Rent
              </h3>


              {PRICE_OPTIONS.map(
                (
                  option
                ) => (
                  <label
                    key={
                      option.value
                    }
                    className={
                      styles.checkOption
                    }
                  >
                    <input
                      type="radio"
                      name="price"
                      checked={
                        priceRange ===
                        option.value
                      }
                      onChange={() =>
                        updatePriceRange(
                          option.value
                        )
                      }
                    />

                    <span
                      className={
                        styles.fakeCheckbox
                      }
                    />

                    <span
                      className={
                        styles.checkLabel
                      }
                    >
                      {
                        option.label
                      }
                    </span>
                  </label>
                )
              )}
            </div>
          </aside>


          {/* =================================================
              RESULTS
          ================================================= */}

          <div
            className={
              styles.resultsColumn
            }
          >
            {loading ? (
              <div
                className={
                  styles.loading
                }
              >
                Loading properties...
              </div>
            ) : error ? (
              <div
                className={
                  styles.error
                }
              >
                {error}
              </div>
            ) : properties.length ===
              0 ? (
              <div
                className={
                  styles.empty
                }
              >
                <Building2
                  size={40}
                />

                <h2>
                  No properties found
                </h2>

                <p>
                  Try changing your
                  search criteria.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className={
                    styles.clearEmptyButton
                  }
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* PROPERTY LIST */}

                <div
                  className={
                    styles.list
                  }
                >
                  {properties.map(
                    (
                      property
                    ) => {
                      const unitType =
                        property.availableTypes ||
                        property.type ||
                        "Property";


                      const detailHref =
                        `/property?id=${encodeURIComponent(
                          property.id
                        )}&purposeCode=${encodeURIComponent(
                          property.purposeCode ||
                            ""
                        )}`;


                      return (
                        <article
                          key={`property-${property.listingId}`}
                          className={
                            styles.propertyCard
                          }
                        >
                          {/* IMAGE */}

                          <Link
                            href={
                              detailHref
                            }
                            className={
                              styles.imageArea
                            }
                          >
                            <ListingImageGallery
                              property={
                                property
                              }
                            />
                          </Link>


                          {/* INFO */}

                          <div
                            className={
                              styles.propertyMainInfo
                            }
                          >
                            <div
                              className={
                                styles.propertyTopRow
                              }
                            />


                            <Link
                              href={
                                detailHref
                              }
                              className={
                                styles.unitTitleLink
                              }
                            >
                              <h2
                                className={
                                  styles.unitTypeHeading
                                }
                              >
                                {
                                  unitType
                                }
                              </h2>
                            </Link>


                            <div
                              className={
                                styles.buildingNameSubtle
                              }
                              title={
                                property.title
                              }
                            >
                              {
                                property.title
                              }
                            </div>


                            <div
                              className={
                                styles.propertyLocationRow
                              }
                            >
                              <MapPin
                                size={16}
                                className={
                                  styles.locationIcon
                                }
                              />

                              <span>
                                {
                                  property.location
                                }
                              </span>
                            </div>


                            <div
                              className={
                                styles.propertyMetaStack
                              }
                            >
                              <div
                                className={
                                  styles.propertyMetaItem
                                }
                              >
                                <Building2
                                  size={17}
                                  className={
                                    styles.metaIcon
                                  }
                                />

                                <span>
                                  {
                                    unitType
                                  }
                                </span>
                              </div>


                              <div
                                className={
                                  styles.propertyMetaItem
                                }
                              >
                                <Ruler
                                  size={17}
                                  className={
                                    styles.metaIcon
                                  }
                                />

                                <span>
                                  {property.maxArea >
                                  property.area
                                    ? `${Number(
                                        property.area
                                      ).toLocaleString(
                                        "en-AE"
                                      )} - ${Number(
                                        property.maxArea
                                      ).toLocaleString(
                                        "en-AE"
                                      )} Sq.Ft.`
                                    : `${Number(
                                        property.area
                                      ).toLocaleString(
                                        "en-AE"
                                      )} Sq.Ft.`}
                                </span>
                              </div>
                            </div>
                          </div>


                          {/* PRICE */}

                          <div
                            className={
                              styles.propertyPricePanel
                            }
                          >
                            <div
                              className={
                                styles.startingFromText
                              }
                            >
                              Starting from
                            </div>


                            {property.price >
                            0 ? (
                              <>
                                <div
                                  className={
                                    styles.propertyPriceValue
                                  }
                                >
                                  {formatPrice(
                                    property.price
                                  )}
                                </div>

                                <div
                                  className={
                                    styles.propertyPricePeriod
                                  }
                                >
                                  per year
                                </div>
                              </>
                            ) : (
                              <div
                                className={
                                  styles.propertyPriceRequest
                                }
                              >
                                Price on Request
                              </div>
                            )}


                            <Link
                              href={
                                detailHref
                              }
                              className={
                                styles.viewPropertyButton
                              }
                            >
                              <span>
                                View Property
                              </span>

                              <span>
                                →
                              </span>
                            </Link>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>


                {/* PAGINATION */}

                {pagination.totalPages >
                  1 && (
                  <div
                    className={
                      styles.pagination
                    }
                  >
                    <button
                      type="button"
                      disabled={
                        page === 1
                      }
                      onClick={() =>
                        setPage(
                          (
                            current
                          ) =>
                            Math.max(
                              1,
                              current - 1
                            )
                        )
                      }
                      className={
                        styles.pageArrow
                      }
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>


                    {Array.from(
                      {
                        length:
                          pagination.totalPages,
                      },
                      (
                        _,
                        index
                      ) =>
                        index + 1
                    )
                      .filter(
                        (
                          pageNumber
                        ) =>
                          pageNumber ===
                            1 ||
                          pageNumber ===
                            pagination.totalPages ||
                          Math.abs(
                            pageNumber -
                              page
                          ) <=
                            2
                      )
                      .map(
                        (
                          pageNumber,
                          index,
                          visiblePages
                        ) => {
                          const previous =
                            visiblePages[
                              index - 1
                            ];


                          return (
                            <React.Fragment
                              key={
                                pageNumber
                              }
                            >
                              {previous &&
                                pageNumber -
                                  previous >
                                  1 && (
                                  <span
                                    className={
                                      styles.ellipsis
                                    }
                                  >
                                    ...
                                  </span>
                                )}


                              <button
                                type="button"
                                onClick={() =>
                                  setPage(
                                    pageNumber
                                  )
                                }
                                className={`${styles.pageNumber} ${
                                  page ===
                                  pageNumber
                                    ? styles.pageNumberActive
                                    : ""
                                }`}
                              >
                                {
                                  pageNumber
                                }
                              </button>
                            </React.Fragment>
                          );
                        }
                      )}


                    <button
                      type="button"
                      disabled={
                        page ===
                        pagination.totalPages
                      }
                      onClick={() =>
                        setPage(
                          (
                            current
                          ) =>
                            Math.min(
                              pagination.totalPages,
                              current + 1
                            )
                        )
                      }
                      className={
                        styles.pageArrow
                      }
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <main
          className={
            styles.page
          }
        >
          <div
            className={
              styles.loading
            }
          >
            Loading properties...
          </div>
        </main>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
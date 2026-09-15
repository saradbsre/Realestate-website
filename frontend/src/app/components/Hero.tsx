"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapPin,
  Building2,
  Tag,
  BedDouble,
  ChevronDown,
  MapPinSearch,
  Ruler,
} from "lucide-react";

import styles from "./hero.module.css";

import {
  getProperties,
  getPropertyFilterOptions,
  getDynamicPropertyFilters,
  type Property,
  type PropertyFilterCategory,
  type DynamicOption,
} from "@/lib/propertyApi";


/* =========================================================
   TYPES
========================================================= */

interface HeroProps {
  onSearch: (filters: {
    location: string;

    unitTypeId:
      | number
      | null;

    beds: string;

    minPrice: string;

    maxPrice: string;

    minArea: string;

    maxArea: string;
  }) => void;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Hero({
  onSearch,
}: HeroProps) {
  /* =======================================================
     LOCATION
  ======================================================= */

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    allProperties,
    setAllProperties,
  ] = useState<Property[]>(
    []
  );

  const [
    suggestions,
    setSuggestions,
  ] = useState<Property[]>(
    []
  );


  /* =======================================================
     PROPERTY TYPE MASTER DATA
  ======================================================= */

  const [
    propertyCategories,
    setPropertyCategories,
  ] = useState<
    PropertyFilterCategory[]
  >([]);

  const [
    propertyGroup,
    setPropertyGroup,
  ] = useState("");

  const [
    propertyCategory,
    setPropertyCategory,
  ] = useState(
    "All Types"
  );

  const [
    selectedUnitTypeId,
    setSelectedUnitTypeId,
  ] = useState<
    number | null
  >(null);


  /* =======================================================
     SELECTED FILTER VALUES
  ======================================================= */

  const [
    areaRange,
    setAreaRange,
  ] = useState("All");

  const [
    beds,
    setBeds,
  ] = useState("All");

  const [
    priceRange,
    setPriceRange,
  ] = useState("All");


  /* =======================================================
     DYNAMIC DB OPTIONS
  ======================================================= */

  const [
    dynamicPropertyTypes,
    setDynamicPropertyTypes,
  ] = useState<
    DynamicOption[]
  >([]);

  const [
    dynamicBeds,
    setDynamicBeds,
  ] = useState<
    DynamicOption[]
  >([]);

  const [
    dynamicAreas,
    setDynamicAreas,
  ] = useState<
    DynamicOption[]
  >([]);

  const [
    dynamicPrices,
    setDynamicPrices,
  ] = useState<
    DynamicOption[]
  >([]);

  const [
    loadingDynamicFilters,
    setLoadingDynamicFilters,
  ] = useState(false);

  const [
    dynamicFiltersLoaded,
    setDynamicFiltersLoaded,
  ] = useState(false);


  /* =======================================================
     DROPDOWNS
  ======================================================= */

  const [
    isPropertyTypeOpen,
    setIsPropertyTypeOpen,
  ] = useState(false);

  const [
    isAreaOpen,
    setIsAreaOpen,
  ] = useState(false);

  const [
    isBedsOpen,
    setIsBedsOpen,
  ] = useState(false);

  const [
    isPriceOpen,
    setIsPriceOpen,
  ] = useState(false);


  const filtersRef =
    useRef<HTMLDivElement | null>(
      null
    );


  /* =======================================================
     LOAD PROPERTY TYPE MASTER
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadPropertyTypes() {
      try {
        const data =
          await getPropertyFilterOptions();

        if (
          cancelled
        ) {
          return;
        }

        setPropertyCategories(
          data
        );

        if (
          data.length > 0
        ) {
          setPropertyGroup(
            data[0]
              .categoryId
          );
        }
      } catch (error) {
        console.error(
          "Error loading property filter options:",
          error
        );
      }
    }

    loadPropertyTypes();

    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =======================================================
     LOAD LOCATION SUGGESTIONS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadLocations() {
      try {
        const {
          properties,
        } =
          await getProperties({
            page: 1,
            pageSize: 100,
          });

        if (
          cancelled
        ) {
          return;
        }

        setAllProperties(
          properties
        );
      } catch (error) {
        console.error(
          "Error loading suggestion list:",
          error
        );
      }
    }

    loadLocations();

    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =======================================================
     CURRENT PROPERTY CATEGORY
  ======================================================= */

  const selectedCategory =
    useMemo(() => {
      return (
        propertyCategories.find(
          (
            category
          ) =>
            category.categoryId ===
            propertyGroup
        ) || null
      );
    }, [
      propertyCategories,
      propertyGroup,
    ]);


  /* =======================================================
     CURRENT UNIT TYPE
  ======================================================= */

  const selectedUnitType =
    useMemo(() => {
      if (
        selectedUnitTypeId ===
        null
      ) {
        return null;
      }

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
              selectedUnitTypeId
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
      selectedUnitTypeId,
    ]);


  /* =======================================================
     APARTMENT CHECK

     Beds applicable only to apartment.
  ======================================================= */

  const isApartment =
    selectedUnitType
      ?.name
      ?.trim()
      .toUpperCase() ===
    "APARTMENT";


  /* =======================================================
     PARSE AREA RANGE
  ======================================================= */

  const selectedArea =
    useMemo(() => {
      if (
        areaRange ===
        "All"
      ) {
        return {
          minArea:
            undefined,

          maxArea:
            undefined,
        };
      }

      const [
        min,
        max,
      ] =
        areaRange.split(
          "-"
        );

      return {
        minArea:
          min !== ""
            ? Number(min)
            : undefined,

        maxArea:
          max !== ""
            ? Number(max)
            : undefined,
      };
    }, [
      areaRange,
    ]);


  /* =======================================================
     PARSE PRICE RANGE
  ======================================================= */

  const selectedPrice =
    useMemo(() => {
      if (
        priceRange ===
        "All"
      ) {
        return {
          minPrice:
            undefined,

          maxPrice:
            undefined,
        };
      }

      const [
        min,
        max,
      ] =
        priceRange.split(
          "-"
        );

      return {
        minPrice:
          min !== ""
            ? Number(min)
            : undefined,

        maxPrice:
          max !== ""
            ? Number(max)
            : undefined,
      };
    }, [
      priceRange,
    ]);


  /* =======================================================
     DYNAMIC / CASCADING FILTERS

     Every selected filter recalculates all other
     available options from active vacant units.
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const timer =
      window.setTimeout(
        async () => {
          try {
            setLoadingDynamicFilters(
              true
            );

            const data =
              await getDynamicPropertyFilters(
                {
                  search:
                    location.trim() ||
                    undefined,

                  unitTypeId:
                    selectedUnitTypeId,

                  beds:
                    isApartment &&
                    beds !== "All"
                      ? beds
                      : undefined,

                  minArea:
                    selectedArea.minArea,

                  maxArea:
                    selectedArea.maxArea,

                  minPrice:
                    selectedPrice.minPrice,

                  maxPrice:
                    selectedPrice.maxPrice,
                }
              );

            if (
              cancelled
            ) {
              return;
            }

            setDynamicPropertyTypes(
              data.propertyTypes ||
                []
            );

            setDynamicBeds(
              data.beds ||
                []
            );

            setDynamicAreas(
              data.areaRanges ||
                []
            );

            setDynamicPrices(
              data.priceRanges ||
                []
            );

            setDynamicFiltersLoaded(
              true
            );


            /* =========================================
               CLEAR INVALID PROPERTY TYPE
            ========================================= */

            if (
              selectedUnitTypeId !==
                null &&
              !data.propertyTypes.some(
                (
                  option
                ) =>
                  Number(
                    option.value
                  ) ===
                  selectedUnitTypeId
              )
            ) {
              setSelectedUnitTypeId(
                null
              );

              setPropertyCategory(
                "All Types"
              );

              setBeds(
                "All"
              );
            }


            /* =========================================
               CLEAR INVALID AREA
            ========================================= */

            if (
              areaRange !==
                "All" &&
              !data.areaRanges.some(
                (
                  option
                ) =>
                  String(
                    option.value
                  ) ===
                  areaRange
              )
            ) {
              setAreaRange(
                "All"
              );
            }


            /* =========================================
               CLEAR INVALID PRICE
            ========================================= */

            if (
              priceRange !==
                "All" &&
              !data.priceRanges.some(
                (
                  option
                ) =>
                  String(
                    option.value
                  ) ===
                  priceRange
              )
            ) {
              setPriceRange(
                "All"
              );
            }


            /* =========================================
               CLEAR INVALID BEDS
            ========================================= */

            if (
              isApartment &&
              beds !==
                "All" &&
              !data.beds.some(
                (
                  option
                ) =>
                  String(
                    option.value
                  ) ===
                  beds
              )
            ) {
              setBeds(
                "All"
              );
            }
          } catch (error) {
            console.error(
              "Unable to refresh dynamic filters:",
              error
            );
          } finally {
            if (
              !cancelled
            ) {
              setLoadingDynamicFilters(
                false
              );
            }
          }
        },
        250
      );

    return () => {
      cancelled =
        true;

      window.clearTimeout(
        timer
      );
    };
  }, [
    location,
    selectedUnitTypeId,
    beds,
    areaRange,
    priceRange,
    isApartment,
    selectedArea.minArea,
    selectedArea.maxArea,
    selectedPrice.minPrice,
    selectedPrice.maxPrice,
  ]);


  /* =======================================================
     AVAILABLE PROPERTY TYPES FOR CURRENT TAB
  ======================================================= */

  const availablePropertyTypes =
    useMemo(() => {
      const types =
        selectedCategory
          ?.types ||
        [];

      /*
       * Before dynamic API returns,
       * show normal master options.
       */
      if (
        !dynamicFiltersLoaded
      ) {
        return types;
      }

      const availableIds =
        new Set(
          dynamicPropertyTypes.map(
            (
              option
            ) =>
              Number(
                option.value
              )
          )
        );

      return types.filter(
        (
          type
        ) =>
          availableIds.has(
            type.id
          )
      );
    }, [
      selectedCategory,
      dynamicPropertyTypes,
      dynamicFiltersLoaded,
    ]);


  /* =======================================================
     SELECTED LABELS
  ======================================================= */

  const selectedAreaLabel =
    useMemo(() => {
      if (
        areaRange ===
        "All"
      ) {
        return "Any Size";
      }

      return (
        dynamicAreas.find(
          (
            option
          ) =>
            String(
              option.value
            ) ===
            areaRange
        )?.label ||
        areaRange
      );
    }, [
      areaRange,
      dynamicAreas,
    ]);


  const selectedPriceLabel =
    useMemo(() => {
      if (
        priceRange ===
        "All"
      ) {
        return "Any Price";
      }

      return (
        dynamicPrices.find(
          (
            option
          ) =>
            String(
              option.value
            ) ===
            priceRange
        )?.label ||
        priceRange
      );
    }, [
      priceRange,
      dynamicPrices,
    ]);


  const selectedBedLabel =
    useMemo(() => {
      if (
        beds ===
        "All"
      ) {
        return "Any";
      }

      return (
        dynamicBeds.find(
          (
            option
          ) =>
            String(
              option.value
            ) ===
            beds
        )?.label ||
        beds
      );
    }, [
      beds,
      dynamicBeds,
    ]);


  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(
          event.target as Node
        )
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  /* =======================================================
     CLOSE DROPDOWNS
  ======================================================= */

  function closeAllDropdowns() {
    setIsPropertyTypeOpen(
      false
    );

    setIsAreaOpen(
      false
    );

    setIsBedsOpen(
      false
    );

    setIsPriceOpen(
      false
    );
  }


  /* =======================================================
     LOCATION CHANGE
  ======================================================= */

  function handleLocationChange(
    value: string
  ) {
    setLocation(
      value
    );

    if (
      !value.trim()
    ) {
      setSuggestions(
        []
      );

      return;
    }

    const searchValue =
      value
        .trim()
        .toLowerCase();

    const uniqueLocations =
      new Map<
        string,
        Property
      >();

    allProperties.forEach(
      (
        property
      ) => {
        const propertyLocation =
          property.location
            ?.trim();

        if (
          !propertyLocation
        ) {
          return;
        }

        if (
          !propertyLocation
            .toLowerCase()
            .includes(
              searchValue
            )
        ) {
          return;
        }

        const key =
          propertyLocation.toLowerCase();

        if (
          !uniqueLocations.has(
            key
          )
        ) {
          uniqueLocations.set(
            key,
            property
          );
        }
      }
    );

    setSuggestions(
      Array.from(
        uniqueLocations.values()
      ).slice(
        0,
        6
      )
    );
  }


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
     FORMAT UNIT TYPE
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
      mapping[key] ||
      formatCategoryName(
        value
      )
    );
  }


  /* =======================================================
     SELECT PROPERTY TYPE
  ======================================================= */

  function selectPropertyType(
    id: number,
    name: string
  ) {
    setSelectedUnitTypeId(
      id
    );

    setPropertyCategory(
      formatUnitType(
        name
      )
    );

    /*
     * Beds belongs to apartment.
     * Reset when property type changes.
     */
    setBeds(
      "All"
    );

    closeAllDropdowns();
  }


  /* =======================================================
     CLEAR PROPERTY TYPE
  ======================================================= */

  function clearPropertyType() {
    setSelectedUnitTypeId(
      null
    );

    setPropertyCategory(
      "All Types"
    );

    setBeds(
      "All"
    );

    setIsBedsOpen(
      false
    );
  }


  /* =======================================================
     SELECT ALL TYPES
  ======================================================= */

  function selectAllTypes() {
    clearPropertyType();

    setIsPropertyTypeOpen(
      false
    );
  }


  /* =======================================================
     SEARCH
  ======================================================= */

  function handleSearchSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    let minPrice =
      "";

    let maxPrice =
      "";

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
        min || "";

      maxPrice =
        max || "";
    }


    let minArea =
      "";

    let maxArea =
      "";

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
        min || "";

      maxArea =
        max || "";
    }


    onSearch({
      location:
        location.trim(),

      unitTypeId:
        selectedUnitTypeId,

      beds:
        isApartment
          ? beds
          : "All",

      minPrice,

      maxPrice,

      minArea,

      maxArea,
    });


    setSuggestions(
      []
    );

    closeAllDropdowns();
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={
        styles.hero
      }
    >
      <div
        className={
          styles.overlay
        }
      />

      <div
        className={
          styles.heroInner
        }
      >
        {/* =================================================
            HEADING
        ================================================= */}

        <div
          className={
            styles.headingArea
          }
        >
          <h1>
            Find the Right Space
            for You
          </h1>

          <p>
            From homes to offices,
            shops, showrooms and
            warehouses, explore
            rental properties
            across prime locations
            in the UAE.
          </p>
        </div>


        {/* =================================================
            SEARCH FORM
        ================================================= */}

        <form
          className={
            styles.searchArea
          }
          onSubmit={
            handleSearchSubmit
          }
        >
          {/* ===============================================
              LOCATION
          =============================================== */}

          <div
            className={
              styles.locationSearchCard
            }
          >
            <div
              className={
                styles.locationLeading
              }
            >
              <div
                className={
                  styles.iconCircle
                }
              >
                <MapPinSearch
                  size={
                    20
                  }
                />
              </div>


              <div
                className={
                  styles.locationField
                }
              >
                <label>
                  LOCATION
                </label>

                <input
                  value={
                    location
                  }
                  onChange={(
                    event
                  ) =>
                    handleLocationChange(
                      event
                        .target
                        .value
                    )
                  }
                  onBlur={() => {
                    window.setTimeout(
                      () => {
                        setSuggestions(
                          []
                        );
                      },
                      200
                    );
                  }}
                  placeholder="Enter location (e.g. Al Qusais, Al Nahda)"
                />


                {/* =========================================
                    LOCATION SUGGESTIONS
                ========================================= */}

                {suggestions.length >
                  0 && (
                  <div
                    className={
                      styles.autocompleteDropdown
                    }
                  >
                    {suggestions.map(
                      (
                        property
                      ) => (
                        <button
                          type="button"
                          key={`suggestion-${property.id}-${property.location}`}
                          className={
                            styles.suggestionItem
                          }
                          onMouseDown={(
                            event
                          ) => {
                            event.preventDefault();

                            setLocation(
                              property.location
                            );

                            setSuggestions(
                              []
                            );
                          }}
                        >
                          <MapPin
                            size={
                              17
                            }
                          />

                          <div>
                            <strong>
                              {
                                property.location
                              }
                            </strong>

                            <span>
                              {
                                property.title
                              }
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>


            {/* =============================================
                SEARCH BUTTON
            ============================================= */}

            <div
              className={
                styles.locationRight
              }
            >
              <button
                type="submit"
                className={
                  styles.searchButton
                }
              >
                <span>
                  Search Rentals
                </span>

                <span
                  className={
                    styles.searchArrow
                  }
                >
                  →
                </span>
              </button>
            </div>
          </div>


          {/* =================================================
              FILTER CARDS
          ================================================= */}

          <div
            ref={
              filtersRef
            }
            className={
              styles.filterCards
            }
          >
            {/* =============================================
                PROPERTY TYPE
            ============================================= */}

            <div
              className={
                styles.filterWrapper
              }
            >
              <button
                type="button"
                className={
                  styles.filterCard
                }
                onClick={() => {
                  setIsPropertyTypeOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setIsAreaOpen(
                    false
                  );

                  setIsBedsOpen(
                    false
                  );

                  setIsPriceOpen(
                    false
                  );
                }}
                aria-expanded={
                  isPropertyTypeOpen
                }
              >
                <div
                  className={
                    styles.filterIcon
                  }
                >
                  <Building2
                    size={
                      20
                    }
                  />
                </div>


                <div
                  className={
                    styles.filterInfo
                  }
                >
                  <span
                    className={
                      styles.filterLabel
                    }
                  >
                    Property Type
                  </span>


                  <div
                    className={
                      styles.filterValueRow
                    }
                  >
                    <strong>
                      {
                        propertyCategory
                      }
                    </strong>


                    {selectedUnitTypeId !==
                      null && (
                      <span
                        role="button"
                        tabIndex={
                          0
                        }
                        aria-label="Clear property type"
                        className={
                          styles.clearSelectedFilter
                        }
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          clearPropertyType();
                        }}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            event.preventDefault();

                            event.stopPropagation();

                            clearPropertyType();
                          }
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                </div>


                <ChevronDown
                  size={
                    15
                  }
                  className={`${styles.chevron} ${
                    isPropertyTypeOpen
                      ? styles.chevronOpen
                      : ""
                  }`}
                />
              </button>


              {/* ===========================================
                  PROPERTY TYPE PANEL
              =========================================== */}

              {isPropertyTypeOpen && (
                <div
                  className={
                    styles.propertyTypePanel
                  }
                >
                  {/* CATEGORY TABS */}

                  <div
                    className={
                      styles.propertyTypeTabs
                    }
                  >
                    {propertyCategories.map(
                      (
                        category
                      ) => (
                        <button
                          key={
                            category.categoryId
                          }
                          type="button"
                          className={`${styles.propertyTypeTab} ${
                            propertyGroup ===
                            category.categoryId
                              ? styles.propertyTypeTabActive
                              : ""
                          }`}
                          onClick={() =>
                            setPropertyGroup(
                              category.categoryId
                            )
                          }
                        >
                          {formatCategoryName(
                            category.categoryName
                          )}
                        </button>
                      )
                    )}
                  </div>


                  {/* ALL TYPES */}

                  <button
                    type="button"
                    className={`${styles.dropdownOption} ${
                      selectedUnitTypeId ===
                      null
                        ? styles.dropdownOptionActive
                        : ""
                    }`}
                    onClick={
                      selectAllTypes
                    }
                  >
                    <span
                      className={
                        styles.radioMark
                      }
                    />

                    <span>
                      All Types
                    </span>
                  </button>


                  {/* AVAILABLE TYPES */}

                  <div
                    className={
                      styles.propertyCategoryList
                    }
                  >
                    {loadingDynamicFilters &&
                    !dynamicFiltersLoaded ? (
                      <div
                        className={
                          styles.dropdownLoading
                        }
                      >
                        Loading...
                      </div>
                    ) : availablePropertyTypes.length >
                      0 ? (
                      availablePropertyTypes.map(
                        (
                          type
                        ) => (
                          <button
                            key={
                              type.id
                            }
                            type="button"
                            className={`${styles.dropdownOption} ${
                              selectedUnitTypeId ===
                              type.id
                                ? styles.dropdownOptionActive
                                : ""
                            }`}
                            onClick={() =>
                              selectPropertyType(
                                type.id,
                                type.name
                              )
                            }
                          >
                            <span
                              className={
                                styles.radioMark
                              }
                            />

                            <span>
                              {formatUnitType(
                                type.name
                              )}
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div
                        className={
                          styles.dropdownEmpty
                        }
                      >
                        No property
                        types available
                        for the selected
                        filters.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>


            {/* =============================================
                UNIT AREA
            ============================================= */}

            <div
              className={
                styles.filterWrapper
              }
            >
              <button
                type="button"
                className={
                  styles.filterCard
                }
                onClick={() => {
                  setIsAreaOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setIsPropertyTypeOpen(
                    false
                  );

                  setIsBedsOpen(
                    false
                  );

                  setIsPriceOpen(
                    false
                  );
                }}
                aria-expanded={
                  isAreaOpen
                }
              >
                <div
                  className={
                    styles.filterIcon
                  }
                >
                  <Ruler
                    size={
                      20
                    }
                  />
                </div>


                <div
                  className={
                    styles.filterInfo
                  }
                >
                  <span
                    className={
                      styles.filterLabel
                    }
                  >
                    Unit Area
                  </span>


                  <div
                    className={
                      styles.filterValueRow
                    }
                  >
                    <strong>
                      {
                        selectedAreaLabel
                      }
                    </strong>


                    {areaRange !==
                      "All" && (
                      <span
                        role="button"
                        tabIndex={
                          0
                        }
                        className={
                          styles.clearSelectedFilter
                        }
                        aria-label="Clear unit area"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setAreaRange(
                            "All"
                          );
                        }}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            event.preventDefault();

                            event.stopPropagation();

                            setAreaRange(
                              "All"
                            );
                          }
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                </div>


                <ChevronDown
                  size={
                    15
                  }
                  className={`${styles.chevron} ${
                    isAreaOpen
                      ? styles.chevronOpen
                      : ""
                  }`}
                />
              </button>


              {/* ===========================================
                  AREA OPTIONS
              =========================================== */}

              {isAreaOpen && (
                <div
                  className={
                    styles.simpleDropdownPanel
                  }
                >
                  <button
                    type="button"
                    className={`${styles.dropdownOption} ${
                      areaRange ===
                      "All"
                        ? styles.dropdownOptionActive
                        : ""
                    }`}
                    onClick={() => {
                      setAreaRange(
                        "All"
                      );

                      setIsAreaOpen(
                        false
                      );
                    }}
                  >
                    <span
                      className={
                        styles.radioMark
                      }
                    />

                    <span>
                      Any Size
                    </span>
                  </button>


                  {loadingDynamicFilters &&
                  !dynamicFiltersLoaded ? (
                    <div
                      className={
                        styles.dropdownLoading
                      }
                    >
                      Loading...
                    </div>
                  ) : dynamicAreas.length >
                    0 ? (
                    dynamicAreas.map(
                      (
                        option
                      ) => (
                        <button
                          key={
                            String(
                              option.value
                            )
                          }
                          type="button"
                          className={`${styles.dropdownOption} ${
                            areaRange ===
                            String(
                              option.value
                            )
                              ? styles.dropdownOptionActive
                              : ""
                          }`}
                          onClick={() => {
                            setAreaRange(
                              String(
                                option.value
                              )
                            );

                            setIsAreaOpen(
                              false
                            );
                          }}
                        >
                          <span
                            className={
                              styles.radioMark
                            }
                          />

                          <span>
                            {
                              option.label
                            }
                          </span>
                        </button>
                      )
                    )
                  ) : (
                    <div
                      className={
                        styles.dropdownEmpty
                      }
                    >
                      No area ranges
                      available.
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* =============================================
                BEDS
            ============================================= */}

            <div
              className={
                styles.filterWrapper
              }
            >
              <button
                type="button"
                className={
                  styles.filterCard
                }
                disabled={
                  !isApartment
                }
                onClick={() => {
                  if (
                    !isApartment
                  ) {
                    return;
                  }

                  setIsBedsOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setIsPropertyTypeOpen(
                    false
                  );

                  setIsAreaOpen(
                    false
                  );

                  setIsPriceOpen(
                    false
                  );
                }}
                aria-expanded={
                  isBedsOpen
                }
                aria-disabled={
                  !isApartment
                }
              >
                <div
                  className={
                    styles.filterIcon
                  }
                >
                  <BedDouble
                    size={
                      20
                    }
                  />
                </div>


                <div
                  className={
                    styles.filterInfo
                  }
                >
                  <span
                    className={
                      styles.filterLabel
                    }
                  >
                    Beds
                  </span>


                  <div
                    className={
                      styles.filterValueRow
                    }
                  >
                    <strong>
                      {isApartment
                        ? selectedBedLabel
                        : "Select Property Type"}
                    </strong>


                    {isApartment &&
                      beds !==
                        "All" && (
                        <span
                          role="button"
                          tabIndex={
                            0
                          }
                          className={
                            styles.clearSelectedFilter
                          }
                          aria-label="Clear beds"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setBeds(
                              "All"
                            );
                          }}
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();

                              event.stopPropagation();

                              setBeds(
                                "All"
                              );
                            }
                          }}
                        >
                          ×
                        </span>
                      )}
                  </div>
                </div>


                <ChevronDown
                  size={
                    15
                  }
                  className={`${styles.chevron} ${
                    isBedsOpen
                      ? styles.chevronOpen
                      : ""
                  }`}
                />
              </button>


              {/* ===========================================
                  BED OPTIONS
              =========================================== */}

              {isApartment &&
                isBedsOpen && (
                  <div
                    className={
                      styles.simpleDropdownPanel
                    }
                  >
                    <button
                      type="button"
                      className={`${styles.dropdownOption} ${
                        beds ===
                        "All"
                          ? styles.dropdownOptionActive
                          : ""
                      }`}
                      onClick={() => {
                        setBeds(
                          "All"
                        );

                        setIsBedsOpen(
                          false
                        );
                      }}
                    >
                      <span
                        className={
                          styles.radioMark
                        }
                      />

                      <span>
                        Any
                      </span>
                    </button>


                    {loadingDynamicFilters &&
                    !dynamicFiltersLoaded ? (
                      <div
                        className={
                          styles.dropdownLoading
                        }
                      >
                        Loading...
                      </div>
                    ) : dynamicBeds.length >
                      0 ? (
                      dynamicBeds.map(
                        (
                          option
                        ) => (
                          <button
                            key={
                              String(
                                option.value
                              )
                            }
                            type="button"
                            className={`${styles.dropdownOption} ${
                              beds ===
                              String(
                                option.value
                              )
                                ? styles.dropdownOptionActive
                                : ""
                            }`}
                            onClick={() => {
                              setBeds(
                                String(
                                  option.value
                                )
                              );

                              setIsBedsOpen(
                                false
                              );
                            }}
                          >
                            <span
                              className={
                                styles.radioMark
                              }
                            />

                            <span>
                              {
                                option.label
                              }
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div
                        className={
                          styles.dropdownEmpty
                        }
                      >
                        No bed options
                        available.
                      </div>
                    )}
                  </div>
                )}
            </div>


            {/* =============================================
                PRICE
            ============================================= */}

            <div
              className={
                styles.filterWrapper
              }
            >
              <button
                type="button"
                className={
                  styles.filterCard
                }
                onClick={() => {
                  setIsPriceOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setIsPropertyTypeOpen(
                    false
                  );

                  setIsAreaOpen(
                    false
                  );

                  setIsBedsOpen(
                    false
                  );
                }}
                aria-expanded={
                  isPriceOpen
                }
              >
                <div
                  className={
                    styles.filterIcon
                  }
                >
                  <Tag
                    size={
                      20
                    }
                  />
                </div>


                <div
                  className={
                    styles.filterInfo
                  }
                >
                  <span
                    className={
                      styles.filterLabel
                    }
                  >
                    Price Range
                  </span>


                  <div
                    className={
                      styles.filterValueRow
                    }
                  >
                    <strong>
                      {
                        selectedPriceLabel
                      }
                    </strong>


                    {priceRange !==
                      "All" && (
                      <span
                        role="button"
                        tabIndex={
                          0
                        }
                        className={
                          styles.clearSelectedFilter
                        }
                        aria-label="Clear price range"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setPriceRange(
                            "All"
                          );
                        }}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            event.preventDefault();

                            event.stopPropagation();

                            setPriceRange(
                              "All"
                            );
                          }
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                </div>


                <ChevronDown
                  size={
                    15
                  }
                  className={`${styles.chevron} ${
                    isPriceOpen
                      ? styles.chevronOpen
                      : ""
                  }`}
                />
              </button>


              {/* ===========================================
                  PRICE OPTIONS
              =========================================== */}

              {isPriceOpen && (
                <div
                  className={
                    styles.simpleDropdownPanel
                  }
                >
                  <button
                    type="button"
                    className={`${styles.dropdownOption} ${
                      priceRange ===
                      "All"
                        ? styles.dropdownOptionActive
                        : ""
                    }`}
                    onClick={() => {
                      setPriceRange(
                        "All"
                      );

                      setIsPriceOpen(
                        false
                      );
                    }}
                  >
                    <span
                      className={
                        styles.radioMark
                      }
                    />

                    <span>
                      Any Price
                    </span>
                  </button>


                  {loadingDynamicFilters &&
                  !dynamicFiltersLoaded ? (
                    <div
                      className={
                        styles.dropdownLoading
                      }
                    >
                      Loading...
                    </div>
                  ) : dynamicPrices.length >
                    0 ? (
                    dynamicPrices.map(
                      (
                        option
                      ) => (
                        <button
                          key={
                            String(
                              option.value
                            )
                          }
                          type="button"
                          className={`${styles.dropdownOption} ${
                            priceRange ===
                            String(
                              option.value
                            )
                              ? styles.dropdownOptionActive
                              : ""
                          }`}
                          onClick={() => {
                            setPriceRange(
                              String(
                                option.value
                              )
                            );

                            setIsPriceOpen(
                              false
                            );
                          }}
                        >
                          <span
                            className={
                              styles.radioMark
                            }
                          />

                          <span>
                            {
                              option.label
                            }
                          </span>
                        </button>
                      )
                    )
                  ) : (
                    <div
                      className={
                        styles.dropdownEmpty
                      }
                    >
                      No price ranges
                      available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
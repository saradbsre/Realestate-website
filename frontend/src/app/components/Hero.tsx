"use client";

import React, {
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
  type Property,
  type PropertyFilterCategory,
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
   PRICE OPTIONS
========================================================= */

const PRICE_OPTIONS = [
  {
    value: "All",
    label: "Any Price",
  },

  {
    value: "0-30000",
    label: "Up to AED 30K",
  },

  {
    value: "30000-50000",
    label: "AED 30K - 50K",
  },

  {
    value: "50000-100000",
    label: "AED 50K - 100K",
  },

  {
    value: "100000-200000",
    label: "AED 100K - 200K",
  },

  {
    value: "200000-",
    label: "AED 200K+",
  },
];


/* =========================================================
   UNIT AREA OPTIONS
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
   BED OPTIONS

   IMPORTANT:
   value = ERP unit.Purpose_type
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
    label: "1 BHK",
  },

  {
    value: "2BK",
    label: "2 BHK",
  },

  {
    value: "3BK",
    label: "3 BHK",
  },

  {
    value: "4BK",
    label: "4 BHK",
  },
];


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
     PROPERTY TYPE
  ======================================================= */

  const [
    propertyCategories,
    setPropertyCategories,
  ] = useState<
    PropertyFilterCategory[]
  >([]);

  /*
   * Category tab:
   *
   * UC01
   * UC02
   */
  const [
    propertyGroup,
    setPropertyGroup,
  ] = useState("");

  /*
   * Display label:
   *
   * All Types
   * Apartment
   * Villa
   * Office
   * etc.
   */
  const [
    propertyCategory,
    setPropertyCategory,
  ] = useState(
    "All Types"
  );

  /*
   * Actual database UnitTypeId
   *
   * null = All Types
   */
  const [
    selectedUnitTypeId,
    setSelectedUnitTypeId,
  ] = useState<
    number | null
  >(null);


  /* =======================================================
     PRICE
  ======================================================= */

  const [
    priceRange,
    setPriceRange,
  ] = useState("All");


  /* =======================================================
     UNIT AREA
  ======================================================= */

  const [
    areaRange,
    setAreaRange,
  ] = useState("All");


  /* =======================================================
     BEDS
  ======================================================= */

  const [
    beds,
    setBeds,
  ] = useState("All");


  /* =======================================================
     DROPDOWNS
  ======================================================= */

  const [
    isPropertyTypeOpen,
    setIsPropertyTypeOpen,
  ] = useState(false);

  const [
    isPriceOpen,
    setIsPriceOpen,
  ] = useState(false);

  const [
    isAreaOpen,
    setIsAreaOpen,
  ] = useState(false);

  const [
    isBedsOpen,
    setIsBedsOpen,
  ] = useState(false);

  const filtersRef =
    useRef<HTMLDivElement | null>(
      null
    );


  /* =======================================================
     LOAD PROPERTY TYPE FILTER OPTIONS
  ======================================================= */

  useEffect(() => {
    getPropertyFilterOptions()
      .then((data) => {
        setPropertyCategories(
          data
        );

        /*
         * Select first category
         * tab by default.
         */
        if (
          data.length > 0
        ) {
          setPropertyGroup(
            data[0]
              .categoryId
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error loading property filter options:",
          error
        );
      });
  }, []);


  /* =======================================================
     LOAD LOCATION SUGGESTION DATA
  ======================================================= */

  useEffect(() => {
    getProperties({
      page: 1,

      pageSize: 6,
    })
      .then(
        ({
          properties,
        }) => {
          setAllProperties(
            properties
          );
        }
      )
      .catch((error) => {
        console.error(
          "Error loading suggestion list:",
          error
        );
      });
  }, []);


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
        setIsPropertyTypeOpen(
          false
        );

        setIsPriceOpen(
          false
        );

        setIsAreaOpen(
          false
        );

        setIsBedsOpen(
          false
        );
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
     CURRENT CATEGORY
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
            (type) =>
              type.id ===
              selectedUnitTypeId
          );

        if (found) {
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
  ======================================================= */

  const isApartment =
    selectedUnitType
      ?.name
      ?.trim()
      .toUpperCase() ===
    "APARTMENT";


  /* =======================================================
     LOCATION CHANGE
  ======================================================= */

  const handleLocationChange = (
    value: string
  ) => {
    setLocation(value);

    if (!value.trim()) {
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
      (property) => {
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
        5
      )
    );
  };


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
     PROPERTY TYPE SELECTION
  ======================================================= */

  const selectPropertyType = (
    id: number,
    name: string
  ) => {
    setSelectedUnitTypeId(
      id
    );

    setPropertyCategory(
      formatUnitType(
        name
      )
    );

    /*
     * Clear Beds whenever
     * property type changes.
     */
    setBeds(
      "All"
    );

    setIsBedsOpen(
      false
    );

    setIsPropertyTypeOpen(
      false
    );
  };


  /* =======================================================
     ALL TYPES
  ======================================================= */

  const selectAllTypes =
    () => {
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

      setIsPropertyTypeOpen(
        false
      );
    };


  /* =======================================================
     SELECTED LABELS
  ======================================================= */

  const selectedPriceLabel =
    PRICE_OPTIONS.find(
      (
        option
      ) =>
        option.value ===
        priceRange
    )?.label ||
    "Any Price";


  const selectedAreaLabel =
    AREA_OPTIONS.find(
      (
        option
      ) =>
        option.value ===
        areaRange
    )?.label ||
    "Any Size";


  const selectedBedLabel =
    BED_OPTIONS.find(
      (
        option
      ) =>
        option.value ===
        beds
    )?.label ||
    "Any";


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchSubmit = (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();


    /* -----------------------------------------------
       PRICE
    ----------------------------------------------- */

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


    /* -----------------------------------------------
       AREA
    ----------------------------------------------- */

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


    /* -----------------------------------------------
       SEARCH
    ----------------------------------------------- */

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

    setIsPropertyTypeOpen(
      false
    );

    setIsPriceOpen(
      false
    );

    setIsAreaOpen(
      false
    );

    setIsBedsOpen(
      false
    );
  };


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
            Find the Right
            Space for You
          </h1>

          <p>
            From homes to
            offices, shops,
            showrooms and
            warehouses,
            explore rental
            properties across
            prime locations in
            the UAE.
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
                    setTimeout(
                      () =>
                        setSuggestions(
                          []
                        ),
                      200
                    );
                  }}
                  placeholder="Enter location (e.g. Al Qusais, Al Nahda)"
                />


                {/* AUTOCOMPLETE */}

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
                          key={`suggestion-${property.id}`}
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


            {/* SEARCH BUTTON */}

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


          {/* ===============================================
              FILTER CARDS
          =============================================== */}

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
                      open
                    ) =>
                      !open
                  );

                  setIsPriceOpen(
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

                  <strong>
                    {
                      propertyCategory
                    }
                  </strong>
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


              {/* PROPERTY TYPE PANEL */}

              {isPropertyTypeOpen && (
                <div
                  className={
                    styles.propertyTypePanel
                  }
                >
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
                          onClick={() =>
                            setPropertyGroup(
                              category.categoryId
                            )
                          }
                          className={`${styles.propertyTypeTab} ${
                            propertyGroup ===
                            category.categoryId
                              ? styles.propertyTypeTabActive
                              : ""
                          }`}
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


                  {/* TYPES */}

                  <div
                    className={
                      styles.propertyCategoryList
                    }
                  >
                    {selectedCategory
                      ?.types
                      .map(
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
                      open
                    ) =>
                      !open
                  );

                  setIsPropertyTypeOpen(
                    false
                  );

                  setIsPriceOpen(
                    false
                  );

                  setIsBedsOpen(
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

                  <strong>
                    {
                      selectedAreaLabel
                    }
                  </strong>
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


              {isAreaOpen && (
                <div
                  className={
                    styles.simpleDropdownPanel
                  }
                >
                  {AREA_OPTIONS.map(
                    (
                      option
                    ) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        className={`${styles.dropdownOption} ${
                          areaRange ===
                          option.value
                            ? styles.dropdownOptionActive
                            : ""
                        }`}
                        onClick={() => {
                          setAreaRange(
                            option.value
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
                      open
                    ) =>
                      !open
                  );

                  setIsPropertyTypeOpen(
                    false
                  );

                  setIsPriceOpen(
                    false
                  );

                  setIsAreaOpen(
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

                  <strong>
                    {isApartment
                      ? selectedBedLabel
                      : "Select Property Type"}
                  </strong>
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


              {isApartment &&
                isBedsOpen && (
                  <div
                    className={
                      styles.simpleDropdownPanel
                    }
                  >
                    {BED_OPTIONS.map(
                      (
                        option
                      ) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          className={`${styles.dropdownOption} ${
                            beds ===
                            option.value
                              ? styles.dropdownOptionActive
                              : ""
                          }`}
                          onClick={() => {
                            setBeds(
                              option.value
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
                      open
                    ) =>
                      !open
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

                  <strong>
                    {
                      selectedPriceLabel
                    }
                  </strong>
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


              {isPriceOpen && (
                <div
                  className={
                    styles.simpleDropdownPanel
                  }
                >
                  {PRICE_OPTIONS.map(
                    (
                      option
                    ) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        className={`${styles.dropdownOption} ${
                          priceRange ===
                          option.value
                            ? styles.dropdownOptionActive
                            : ""
                        }`}
                        onClick={() => {
                          setPriceRange(
                            option.value
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
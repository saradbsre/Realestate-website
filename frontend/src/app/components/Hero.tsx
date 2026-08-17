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
     BEDS

     This stores ERP Purpose_type:
     STD
     1BK
     2BK
     etc.
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

      pageSize: 100,
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

     Beds only applies to Apartment.
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

    /*
     * Avoid duplicate location
     * suggestions from different
     * buildings.
     */
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
      ).slice(0, 5)
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
        (char) =>
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
     * Whenever property type
     * changes clear Beds.
     */
    setBeds("All");

    setIsBedsOpen(false);

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

      setBeds("All");

      setIsBedsOpen(false);

      setIsPropertyTypeOpen(
        false
      );
    };

  /* =======================================================
     PRICE LABEL
  ======================================================= */

  const selectedPriceLabel =
    PRICE_OPTIONS.find(
      (option) =>
        option.value ===
        priceRange
    )?.label ||
    "Any Price";

  /* =======================================================
     BED LABEL
  ======================================================= */

  const selectedBedLabel =
    BED_OPTIONS.find(
      (option) =>
        option.value ===
        beds
    )?.label || "Any";

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    let minPrice =
      "";

    let maxPrice =
      "";

    if (
      priceRange !==
      "All"
    ) {
      const [min, max] =
        priceRange.split(
          "-"
        );

      minPrice =
        min || "";

      maxPrice =
        max || "";
    }

    onSearch({
      location:
        location.trim(),

      /*
       * Database UnitTypeId
       */
      unitTypeId:
        selectedUnitTypeId,

      /*
       * Only Apartment can
       * send a Beds filter.
       *
       * Value will be:
       * STD
       * 1BK
       * 2BK
       * ...
       */
      beds:
        isApartment
          ? beds
          : "All",

      minPrice,

      maxPrice,
    });

    setSuggestions(
      []
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
              LOCATION SEARCH
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
                  size={20}
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
                  onChange={(e) =>
                    handleLocationChange(
                      e.target
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

                {/* =========================================
                    AUTOCOMPLETE
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
                          key={`suggestion-${property.id}`}
                          className={
                            styles.suggestionItem
                          }
                          onMouseDown={(
                            event
                          ) => {
                            /*
                             * Prevent blur
                             * before selection.
                             */
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
                    Property
                    Type
                  </span>

                  <strong>
                    {
                      propertyCategory
                    }
                  </strong>
                </div>

                <ChevronDown
                  size={15}
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

                  {/* =========================================
                      UNIT TYPES

                      IMPORTANT:
                      Only ONE propertyCategoryList.
                  ========================================= */}

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
                  size={15}
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

            {/* =============================================
                BEDS

                Only Apartment should use this filter.
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

                  setIsPriceOpen(
                    false
                  );

                  setIsPropertyTypeOpen(
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
                  size={15}
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
          </div>
        </form>
      </div>
    </section>
  );
}
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
  type Property,
  type PropertyFilterCategory,
} from "@/lib/propertyApi";

import styles from "./properties.module.css";

const PAGE_SIZE = 10;

/*
|--------------------------------------------------------------------------
| Beds
|--------------------------------------------------------------------------
|
| These values are the actual ERP Purpose_type codes.
|
*/
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

/*
|--------------------------------------------------------------------------
| Price
|--------------------------------------------------------------------------
*/
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

function PropertiesContent() {
  /*
  |--------------------------------------------------------------------------
  | Results
  |--------------------------------------------------------------------------
  */
const searchParams =
  useSearchParams();
  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      pageSize: PAGE_SIZE,
      totalRecords: 0,
      totalPages: 0,
    });

  /*
  |--------------------------------------------------------------------------
  | Filter options loaded from database
  |--------------------------------------------------------------------------
  */

  const [
    propertyCategories,
    setPropertyCategories,
  ] = useState<
    PropertyFilterCategory[]
  >([]);

  const [
    loadingFilterOptions,
    setLoadingFilterOptions,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Selected filters
  |--------------------------------------------------------------------------
  */

  /*
   * Location input is separated from actual
   * search value so we can debounce it.
   */
  const [
    locationInput,
    setLocationInput,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  /*
   * null = All Properties
   */
  const [
    unitTypeId,
    setUnitTypeId,
  ] = useState<number | null>(
    null
  );

  /*
   * ERP Purpose_type:
   *
   * All
   * STD
   * 1BK
   * 2BK
   * ...
   */
  const [beds, setBeds] =
    useState("All");

  const [
    priceRange,
    setPriceRange,
  ] = useState("All");

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Property Type options
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
  const search =
    searchParams.get("search");

  if (search) {
    setLocationInput(search);
    setLocation(search);
    setPage(1);
  }
}, [searchParams]);

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        setLoadingFilterOptions(
          true
        );

        const data =
          await getPropertyFilterOptions();

        setPropertyCategories(
          data
        );
      } catch (error) {
        console.error(
          "Unable to load property filter options:",
          error
        );
      } finally {
        setLoadingFilterOptions(
          false
        );
      }
    }

    loadFilterOptions();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Debounce location
  |--------------------------------------------------------------------------
  |
  | Prevent API request for every single key stroke.
  |
  */

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setLocation(
          locationInput.trim()
        );

        setPage(1);
      },
      400
    );

    return () =>
      clearTimeout(timer);
  }, [locationInput]);

  /*
  |--------------------------------------------------------------------------
  | Load properties when filters change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadProperties();
  }, [
    page,
    location,
    unitTypeId,
    beds,
    priceRange,
  ]);


  

  /*
  |--------------------------------------------------------------------------
  | Selected Unit Type
  |--------------------------------------------------------------------------
  */

  const selectedUnitType =
    useMemo(() => {
      for (
        const category of
        propertyCategories
      ) {
        const type =
          category.types.find(
            (item) =>
              item.id ===
              unitTypeId
          );

        if (type) {
          return type;
        }
      }

      return null;
    }, [
      propertyCategories,
      unitTypeId,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Beds should apply to Apartment only
  |--------------------------------------------------------------------------
  */

  const isApartment =
    selectedUnitType?.name
      ?.trim()
      .toUpperCase() ===
    "APARTMENT";

  /*
  |--------------------------------------------------------------------------
  | Load API
  |--------------------------------------------------------------------------
  */
/* =========================================================
   BREADCRUMB VALUES
========================================================= */

const selectedCategoryName =
  useMemo(() => {
    if (!unitTypeId) {
      return null;
    }

    for (const category of propertyCategories) {
      const found = category.types.some(
        (type) => type.id === unitTypeId
      );

      if (found) {
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
        (option) =>
          option.value === beds
      )?.label || null
    : null;
  async function loadProperties() {
    try {
      setLoading(true);

      setError("");

      let minPrice:
        | string
        | undefined;

      let maxPrice:
        | string
        | undefined;

      if (
        priceRange !== "All"
      ) {
        const [min, max] =
          priceRange.split("-");

        minPrice =
          min || undefined;

        maxPrice =
          max || undefined;
      }

      const result =
        await getProperties({
          page,

          pageSize:
            PAGE_SIZE,

          /*
           * Location only
           */
          search:
            location ||
            undefined,

          /*
           * New backend filter
           */
          unitTypeId:
            unitTypeId ??
            undefined,

          /*
           * Only send Beds when
           * Apartment is selected.
           */
          beds:
            isApartment &&
            beds !== "All"
              ? beds
              : undefined,

          minPrice,

          maxPrice,
        });

      setProperties(
        result.properties
      );

      setPagination(
        result.pagination
      );
    } catch (error) {
      console.error(
        "Unable to load properties:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load properties"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Select Property Type
  |--------------------------------------------------------------------------
  */

  const updatePropertyType = (
    id: number | null
  ) => {
    setUnitTypeId(id);

    /*
     * Clear Beds whenever property
     * type changes.
     */
    setBeds("All");

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Price
  |--------------------------------------------------------------------------
  */

  const updatePriceRange = (
    value: string
  ) => {
    setPriceRange(value);

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Beds
  |--------------------------------------------------------------------------
  */

  const updateBeds = (
    value: string
  ) => {
    setBeds(value);

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setLocationInput("");

    setLocation("");

    setUnitTypeId(null);

    setBeds("All");

    setPriceRange("All");

    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Format category
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Format Unit Type
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Price formatter
  |--------------------------------------------------------------------------
  */

  const formatPrice = (
    price: number
  ) => {
    return new Intl.NumberFormat(
      "en-AE",
      {
        style: "currency",

        currency: "AED",

        maximumFractionDigits: 0,
      }
    ).format(price);
  };

  /*
  |--------------------------------------------------------------------------
  | Compact Property Types
  |--------------------------------------------------------------------------
  */

  function compactAvailableTypes(
    value: string
  ) {
    const list = (
      value || ""
    )
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

    if (list.length <= 4) {
      return list.join(
        " • "
      );
    }

    return `${list
      .slice(0, 4)
      .join(" • ")} +${
      list.length - 4
    } more`;
  }

  return (
    <main
      className={
        styles.page
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

     

{/* =================================================
    DYNAMIC BREADCRUMB
================================================= */}

<div className={styles.breadcrumbBar}>
  <div className={styles.breadcrumbContainer}>
    <nav
      className={styles.breadcrumb}
      aria-label="Breadcrumb"
    >
      {/* HOME */}

      <Link
        href="/"
        className={styles.breadcrumbLink}
      >
        <Home size={14} />

        <span>Home</span>
      </Link>

      <ChevronRight
        size={14}
        className={styles.breadcrumbArrow}
      />

      {/* PROPERTIES */}

      <Link
        href="/properties"
        className={styles.breadcrumbLink}
      >
        Properties for Rent
      </Link>

      {/* LOCATION */}

      {location && (
        <>
          <ChevronRight
            size={14}
            className={styles.breadcrumbArrow}
          />

          <button
            type="button"
            className={styles.breadcrumbButton}
            onClick={() => {
              setLocationInput(location);
              setPage(1);
            }}
          >
            {location}
          </button>
        </>
      )}

      {/* CATEGORY */}

      {selectedCategoryName && (
        <>
          <ChevronRight
            size={14}
            className={styles.breadcrumbArrow}
          />

          <span
            className={styles.breadcrumbText}
          >
            {selectedCategoryName}
          </span>
        </>
      )}

      {/* PROPERTY TYPE */}

      {selectedPropertyTypeName && (
        <>
          <ChevronRight
            size={14}
            className={styles.breadcrumbArrow}
          />

          <span
            className={styles.breadcrumbText}
          >
            {selectedPropertyTypeName}
          </span>
        </>
      )}

      {/* BEDS */}

      {selectedBedName && (
        <>
          <ChevronRight
            size={14}
            className={styles.breadcrumbArrow}
          />

          <span
            className={styles.breadcrumbCurrent}
          >
            {selectedBedName}
          </span>
        </>
      )}

      {/* DEFAULT */}

      {!location &&
        !selectedPropertyTypeName && (
          <>
            <ChevronRight
              size={14}
              className={styles.breadcrumbArrow}
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
<section className={styles.resultsHero}>
  <div className={styles.resultsHeroInner}>
    <div>
      <span className={styles.resultsEyebrow}>
        RENTAL PROPERTIES
      </span>

      <h1>
        Properties for Rent
      </h1>

      <p>
        Find available residential and commercial
        properties across the UAE.
      </p>
    </div>

    <div className={styles.resultsHeroCount}>
      <strong>
        {pagination.totalRecords.toLocaleString()}
      </strong>

      <span>
        Properties Available
      </span>
    </div>
  </div>
</section>

<section className={styles.container}>

        {/* MOBILE FILTER */}

        <button
          type="button"
          className={
            styles.mobileFilterButton
          }
          onClick={() =>
            setMobileFiltersOpen(
              (open) => !open
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
              FILTER SIDEBAR
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

            {/* =============================================
                LOCATION
            ============================================= */}

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
                  onChange={(e) =>
                    setLocationInput(
                      e.target
                        .value
                    )
                  }
                  placeholder="Area or community"
                  className={
                    styles.locationFilter
                  }
                />
              </div>
            </div>

            {/* =============================================
                PROPERTY TYPE
            ============================================= */}

            <div
              className={
                styles.filterSection
              }
            >
              <h3>
                Property Type
              </h3>

              {/* ALL */}

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

              {/* DB OPTIONS */}

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

            {/* =============================================
                BEDS

                Only useful for Apartment.
            ============================================= */}

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

            {/* =============================================
                PRICE
            ============================================= */}

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
                  No properties
                  found
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
                {/* =========================================
                    PROPERTY LIST
                ========================================= */}

                <div
                  className={
                    styles.list
                  }
                >
                  {properties.map(
                    (
                      property
                    ) => {
                      let images:
                        string[] =
                        [];

                      try {
                        images =
                          JSON.parse(
                            property.images ||
                              "[]"
                          );
                      } catch {}

                      const image =
                        images[0];

                      return (
                        
                        <article
                          key={`property-${property.id}`}
                          className={
                            styles.propertyCard
                          }
                        >
                          {/* IMAGE */}

                    <Link
  href={`/property?id=${encodeURIComponent(
    property.id
  )}`}
  className={styles.imageArea}
>
                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={
                                  property.title
                                }
                              />
                            ) : (
                              <div
                                className={
                                  styles.fallbackImage
                                }
                              >
                                <Building2
                                  size={
                                    42
                                  }
                                />
                              </div>
                            )}
                          </Link>

                          {/* INFORMATION */}

                          <div
                            className={
                              styles.propertyInfo
                            }
                          >
                            <Link
  href={`/property?id=${encodeURIComponent(
    property.id
  )}`}
  className={styles.titleLink}
>
  <h2>
    {property.title}
  </h2>
</Link>

                            <div
                              className={
                                styles.location
                              }
                            >
                              <MapPin
                                size={
                                  15
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
                                styles.propertyDetails
                              }
                            >
                              <div
                                className={
                                  styles.detailRow
                                }
                              >
                                <Building2
                                  size={
                                    16
                                  }
                                />

                                <strong>
                                  {compactAvailableTypes(
                                    property.availableTypes
                                  )}
                                </strong>
                              </div>

                              <div
                                className={
                                  styles.detailRow
                                }
                              >
                                <Ruler
                                  size={
                                    16
                                  }
                                />

                                <span>
                                  {property.maxArea >
                                  property.area
                                    ? `${property.area.toLocaleString()} - ${property.maxArea.toLocaleString()} Sq.Ft.`
                                    : `${property.area.toLocaleString()} Sq.Ft.`}
                                </span>
                              </div>
                            </div>

                            <div
                              className={
                                styles.vacancy
                              }
                            >
                              <span
                                className={
                                  styles.vacancyNumber
                                }
                              >
                                {
                                  property.vacantUnits
                                }
                              </span>

                              <span>
                                Vacant{" "}
                                {property.vacantUnits ===
                                1
                                  ? "Unit"
                                  : "Units"}
                              </span>
                            </div>
                          </div>

                          {/* PRICE */}

                          <div
                            className={
                              styles.propertyAction
                            }
                          >
                            <div
                              className={
                                styles.priceLabel
                              }
                            >
                              Starting
                              from
                            </div>

                            {property.price >
                            0 ? (
                              <>
                                <div
                                  className={
                                    styles.price
                                  }
                                >
                                  {formatPrice(
                                    property.price
                                  )}
                                </div>

                                <div
                                  className={
                                    styles.period
                                  }
                                >
                                  per year
                                </div>
                              </>
                            ) : (
                              <div
                                className={
                                  styles.priceRequest
                                }
                              >
                                Price on
                                Request
                              </div>
                            )}

                       <Link
  href={`/property?id=${encodeURIComponent(
    property.id
  )}`}
  className={styles.viewButton}
>
  View Property

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

                {/* =========================================
                    PAGINATION
                ========================================= */}

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
                            current -
                            1
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
                        index +
                        1
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
                              index -
                                1
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
                            current +
                            1
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

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <main
          className={styles.page}
        >
          <div
            className={styles.loading}
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
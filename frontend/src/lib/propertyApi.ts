/* =========================================================
   PROPERTY GALLERY IMAGE
========================================================= */

export interface PropertyGalleryImage {
  imagePath: string;

  imageUrl:
    string | null;

  imageType:
    | "BUILDING"
    | "UNIT";

  displayOrder: number;

  imageId: number;
}


/* =========================================================
   PROPERTY
========================================================= */

export interface Property {
  /*
   * Unique listing ID.
   *
   * Example:
   * P:363|STD
   */
  listingId: string;


  /*
   * Building ID.
   *
   * Example:
   * P:363
   */
  id: string;


  title: string;

  description: string;


  /* =======================================================
     PRICE
  ======================================================= */

  price: number;

  maxPrice: number;


  /* =======================================================
     LOCATION
  ======================================================= */

  location: string;


  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  type: string;

  availableTypes: string;

  purposeCode: string;

  purpose: string;

  status: string;


  /* =======================================================
     BED / BATH
  ======================================================= */

  beds: number;

  baths: number;


  amenities?: string[];


  /* =======================================================
     AREA
  ======================================================= */

  area: number;

  maxArea: number;


  /* =======================================================
     LEGACY IMAGES
  ======================================================= */

  images: string;


  /* =======================================================
     BUILDING + UNIT GALLERY
  ======================================================= */

  galleryImages:
    PropertyGalleryImage[];


  /* =======================================================
     ERP
  ======================================================= */

  erpId:
    string | null;


  /* =======================================================
     VACANCY
  ======================================================= */

  vacantUnits: number;


  /* =======================================================
     WEBSITE DISPLAY
  ======================================================= */

  webDisplayOrder:
    number | null;


  /* =======================================================
     PRIMARY IMAGE
  ======================================================= */

  primaryImagePath?:
    string | null;

  primaryImageUrl?:
    string | null;
}


/* =========================================================
   PROPERTY FILTERS
========================================================= */

export interface PropertyFilters {
  /* Location / search */
  search?: string;


  /* Building */
  buildingId?: string;


  /* Unit */
  unitDesc?: string;


  /* Property Type */
  unitTypeId?:
    | string
    | number;


  /* Beds / Purpose Code */
  beds?: string;


  /* Price */
  minPrice?:
    | string
    | number;

  maxPrice?:
    | string
    | number;


  /* Area */
  minArea?:
    | string
    | number;

  maxArea?:
    | string
    | number;


  /* Pagination */
  page?: number;

  pageSize?: number;


  /* View Mode */
  view?:
    | "building"
    | "unitType";
}


/* =========================================================
   PROPERTY UNIT
========================================================= */

export interface PropertyUnit {
  referenceNo:
    string | null;

  unitName:
    string | null;

  purposeCode:
    string;

  propertyType:
    string;

  description:
    string | null;

  floorNumber:
    | string
    | number
    | null;


  area:
    number;

  areaUnit:
    string;


  annualRent:
    number;

  maxAnnualRent:
    number;

  currency:
    string;


  numberOfPayments:
    number | null;


  airConditioning:
    string | null;

  painted:
    string | null;

  waterMeter:
    string | null;

  electricityMeter:
    string | null;

  securityDeposit:
    number | null;

  isWithBalcony:
    | number
    | boolean
    | null;


  vacant:
    string;

  isActive:
    boolean;


  image:
    string | null;


  lastUpdated:
    string | null;
}


/* =========================================================
   BUILDING FILTER OPTION
========================================================= */

export interface PropertyBuildingOption {
  buildingId: string;

  buildingName: string;
}


/* =========================================================
   UNIT FILTER OPTION
========================================================= */

export interface PropertyUnitOption {
  unitDesc: string;

  purposeCode:
    string | null;

  unitType:
    string | null;

  annualRent:
    number | null;
}


/* =========================================================
   BACKEND PROPERTY
========================================================= */

interface BackendProperty {
  /*
   * Grouped listing ID.
   *
   * P:363|STD
   */
  listingId?:
    string;


  /*
   * Building ID.
   */
  id: string;


  title: string;


  buildingType?:
    string;

  address?:
    string;

  areaName?:
    string;

  placeName?:
    string;

  neighborhood?:
    string;

  location?:
    string;


  /* =======================================================
     TYPE
  ======================================================= */

  purposeCode?:
    string;

  propertyType?:
    string;

  availableTypes?:
    string;


  /* =======================================================
     AREA
  ======================================================= */

  area?:
    number;

  maxArea?:
    number;


  /* =======================================================
     PRICE
  ======================================================= */

  price?:
    number;

  maxPrice?:
    number;


  currency?:
    string;

  rentalPeriod?:
    string;

  purpose?:
    string;


  /* =======================================================
     VACANCY
  ======================================================= */

  vacantUnits?:
    number;


  /* =======================================================
     ERP REFERENCE
  ======================================================= */

  referenceNo?:
    string;


  /* =======================================================
     DISPLAY
  ======================================================= */

  webDisplayOrder?:
    number | null;


  /* =======================================================
     PRIMARY IMAGE
  ======================================================= */

  primaryImagePath?:
    string | null;

  primaryImageUrl?:
    string | null;


  /* =======================================================
     GALLERY
  ======================================================= */

  galleryImages?:
    PropertyGalleryImage[];
}


/* =========================================================
   BACKEND PROPERTY LIST RESPONSE
========================================================= */

interface BackendPropertyList {
  success?:
    boolean;

  data:
    BackendProperty[];

  pagination: {
    page:
      number;

    pageSize:
      number;

    totalRecords:
      number;

    totalPages:
      number;
  };
}


/* =========================================================
   PROPERTY FILTER TYPE
========================================================= */

export interface PropertyFilterType {
  id: number;

  name: string;
}


/* =========================================================
   PROPERTY FILTER CATEGORY
========================================================= */

export interface PropertyFilterCategory {
  categoryId: string;

  categoryName: string;

  types:
    PropertyFilterType[];
}


/* =========================================================
   FILTER RESPONSE
========================================================= */

interface PropertyFilterResponse {
  success: boolean;

  data:
    PropertyFilterCategory[];
}


/* =========================================================
   BUILDING / UNIT FILTER RESPONSE
========================================================= */

interface PropertyBuildingUnitOptionsResponse {
  success: boolean;

  data: {
    buildings:
      PropertyBuildingOption[];

    units:
      PropertyUnitOption[];
  };
}


/* =========================================================
   BACKEND URL
========================================================= */

const API_BASE_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "";


/* =========================================================
   API URL HELPER
========================================================= */

function apiUrl(
  path: string
) {
  if (
    !API_BASE_URL
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  return `${
    API_BASE_URL.replace(
      /\/$/,
      ""
    )
  }/api${path}`;
}


/* =========================================================
   COMMON JSON READER
========================================================= */

async function readJson<T>(
  response: Response
): Promise<T> {
  if (
    !response.ok
  ) {
    const body =
      await response
        .json()
        .catch(
          () =>
            null
        );

    throw new Error(
      body?.error ||
      body?.message ||
      `API request failed (${response.status})`
    );
  }

  const data =
    await response.json();

  return data as T;
}


/* =========================================================
   PROPERTY TYPE FORMATTER
========================================================= */

function formatPropertyType(
  type: string
): string {
  const value =
    type
      .trim()
      .replace(
        /\s+/g,
        " "
      )
      .toUpperCase();


  const exactMappings:
    Record<
      string,
      string
    > = {
      STUDIO:
        "Studio",

      "STUDIO FLAT":
        "Studio",

      OFFICE:
        "Office",

      "OFFICE FLAT":
        "Office",

      SHOP:
        "Shop",

      SHOWROOM:
        "Showroom",

      "SHOW ROOM":
        "Showroom",

      VILLA:
        "Villa",

      WAREHOUSE:
        "Warehouse",

      "WARE HOUSE":
        "Warehouse",

      PENTHOUSE:
        "Penthouse",

      DUPLEX:
        "Duplex",

      TOWNHOUSE:
        "Townhouse",

      "TOWN HOUSE":
        "Townhouse",

      RETAIL:
        "Retail",

      STORE:
        "Store",

      "LABOUR CAMP":
        "Labour Camp",
    };


  if (
    exactMappings[
      value
    ]
  ) {
    return exactMappings[
      value
    ];
  }


  /*
   * ERP Examples:
   *
   * 1 BED ROOM HALL
   * 2 BED ROOM HALL
   */
  const bedroomMatch =
    value.match(
      /^(\d+)\s*BED\s*ROOM(?:\s*HALL)?$/
    );


  if (
    bedroomMatch
  ) {
    return `${
      bedroomMatch[1]
    } Bed`;
  }


  /*
   * Examples:
   *
   * 1 BEDROOM
   * 2 BEDROOM
   */
  const bedroomMatch2 =
    value.match(
      /^(\d+)\s*BEDROOM(?:\s*HALL)?$/
    );


  if (
    bedroomMatch2
  ) {
    return `${
      bedroomMatch2[1]
    } Bed`;
  }


  return type
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


/* =========================================================
   AVAILABLE TYPES FORMATTER
========================================================= */

function formatAvailableTypes(
  availableTypes?:
    string
): string {
  if (
    !availableTypes
  ) {
    return "";
  }


  const formatted =
    availableTypes
      .split(",")
      .map(
        (
          type
        ) =>
          formatPropertyType(
            type
          )
      )
      .filter(
        Boolean
      );


  return [
    ...new Set(
      formatted
    ),
  ].join(
    ", "
  );
}


/* =========================================================
   NORMALIZE GALLERY
========================================================= */

function normalizeGalleryImages(
  images:
    | PropertyGalleryImage[]
    | undefined
): PropertyGalleryImage[] {
  if (
    !Array.isArray(
      images
    )
  ) {
    return [];
  }


  const seenPaths =
    new Set<string>();


  return images
    .filter(
      (
        image
      ) => {
        const path =
          String(
            image.imagePath ||
            ""
          ).trim();


        if (
          !path
        ) {
          return false;
        }


        /*
         * Avoid duplicate image paths.
         *
         * Important because reused
         * unit images can reference
         * the same R2 object.
         */
        if (
          seenPaths.has(
            path
          )
        ) {
          return false;
        }


        seenPaths.add(
          path
        );

        return true;
      }
    )
    .map(
      (
        image
      ) => ({
        imagePath:
          String(
            image.imagePath
          ),

        imageUrl:
          image.imageUrl ||
          null,

        imageType:
          image.imageType ===
          "UNIT"
            ? "UNIT"
            : "BUILDING",

        displayOrder:
          Number(
            image.displayOrder
          ) ||
          0,

        imageId:
          Number(
            image.imageId
          ) ||
          0,
      })
    );
}


/* =========================================================
   NORMALIZE PROPERTY
========================================================= */

function normalizeProperty(
  property:
    BackendProperty
): Property {
  const purposeCode =
    String(
      property.purposeCode ||
      ""
    ).trim();


  const galleryImages =
    normalizeGalleryImages(
      property.galleryImages
    );


  /* =======================================================
     PRIMARY IMAGE
  ======================================================= */

  const primaryImageUrl =
    property.primaryImageUrl ??
    galleryImages[0]
      ?.imageUrl ??
    null;


  const primaryImagePath =
    property.primaryImagePath ??
    galleryImages[0]
      ?.imagePath ??
    null;


  return {
    /* =====================================================
       LISTING ID
    ===================================================== */

    listingId:
      property.listingId ||
      `${String(
        property.id
      )}|${purposeCode}`,


    /* =====================================================
       BUILDING
    ===================================================== */

    id:
      String(
        property.id
      ),

    title:
      property.title ||
      "",

    description:
      "",


    /* =====================================================
       PRICE
    ===================================================== */

    price:
      Number(
        property.price ??
        0
      ),

    maxPrice:
      Number(
        property.maxPrice ??
        property.price ??
        0
      ),


    /* =====================================================
       LOCATION
    ===================================================== */

    location:
      property.location ||
      "",


    /* =====================================================
       TYPE
    ===================================================== */

    type:
      formatPropertyType(
        property.propertyType ||
        property.availableTypes ||
        "Property"
      ),

    availableTypes:
      formatAvailableTypes(
        property.availableTypes ||
        property.propertyType ||
        ""
      ),

    purposeCode,


    /* =====================================================
       PURPOSE
    ===================================================== */

    purpose:
      property.purpose ||
      "Rent",

    status:
      "Ready",


    /* =====================================================
       BED / BATH
    ===================================================== */

    beds:
      0,

    baths:
      0,


    /* =====================================================
       AREA
    ===================================================== */

    area:
      Number(
        property.area ??
        0
      ),

    maxArea:
      Number(
        property.maxArea ??
        property.area ??
        0
      ),


    /* =====================================================
       IMAGES
    ===================================================== */

    images:
      "[]",

    galleryImages,

    primaryImagePath,

    primaryImageUrl,


    /* =====================================================
       ERP
    ===================================================== */

    erpId:
      property.referenceNo ||
      null,


    /* =====================================================
       VACANCY
    ===================================================== */

    vacantUnits:
      Number(
        property.vacantUnits ??
        0
      ),


    /* =====================================================
       WEBSITE DISPLAY
    ===================================================== */

    webDisplayOrder:
      property.webDisplayOrder ??
      null,
  };
}


/* =========================================================
   SAFE BUILDING ID
========================================================= */

function encodeBuildingId(
  id: string
) {
  let decodedId =
    id;


  try {
    decodedId =
      decodeURIComponent(
        id
      );
  } catch {
    decodedId =
      id;
  }


  return encodeURIComponent(
    decodedId.trim()
  );
}


/* =========================================================
   GET PROPERTIES
========================================================= */

export async function getProperties(
  filters:
    PropertyFilters = {}
) {
  const params =
    new URLSearchParams();


  /* =======================================================
     SEARCH / LOCATION
  ======================================================= */

  if (
    filters.search !==
      undefined &&
    String(
      filters.search
    ).trim() !==
      ""
  ) {
    params.set(
      "search",
      String(
        filters.search
      ).trim()
    );
  }


  /* =======================================================
     BUILDING
  ======================================================= */

  if (
    filters.buildingId &&
    filters.buildingId
      .trim() !==
      ""
  ) {
    params.set(
      "buildingId",
      filters.buildingId
        .trim()
    );
  }


  /* =======================================================
     UNIT
  ======================================================= */

  if (
    filters.unitDesc &&
    filters.unitDesc
      .trim() !==
      ""
  ) {
    params.set(
      "unitDesc",
      filters.unitDesc
        .trim()
    );
  }


  /* =======================================================
     PROPERTY TYPE
  ======================================================= */

  if (
    filters.unitTypeId !==
      undefined &&
    filters.unitTypeId !==
      null &&
    filters.unitTypeId !==
      ""
  ) {
    params.set(
      "unitTypeId",
      String(
        filters.unitTypeId
      )
    );
  }


  /* =======================================================
     BEDS
  ======================================================= */

  if (
    filters.beds &&
    filters.beds !==
      "All"
  ) {
    params.set(
      "beds",
      filters.beds
    );
  }


  /* =======================================================
     MIN PRICE
  ======================================================= */

  if (
    filters.minPrice !==
      undefined &&
    filters.minPrice !==
      ""
  ) {
    params.set(
      "minPrice",
      String(
        filters.minPrice
      )
    );
  }


  /* =======================================================
     MAX PRICE
  ======================================================= */

  if (
    filters.maxPrice !==
      undefined &&
    filters.maxPrice !==
      ""
  ) {
    params.set(
      "maxPrice",
      String(
        filters.maxPrice
      )
    );
  }


  /* =======================================================
     MIN AREA
  ======================================================= */

  if (
    filters.minArea !==
      undefined &&
    filters.minArea !==
      ""
  ) {
    params.set(
      "minArea",
      String(
        filters.minArea
      )
    );
  }


  /* =======================================================
     MAX AREA
  ======================================================= */

  if (
    filters.maxArea !==
      undefined &&
    filters.maxArea !==
      ""
  ) {
    params.set(
      "maxArea",
      String(
        filters.maxArea
      )
    );
  }


  /* =======================================================
     PAGE
  ======================================================= */

  if (
    filters.page !==
      undefined
  ) {
    params.set(
      "page",
      String(
        filters.page
      )
    );
  }


  /* =======================================================
     PAGE SIZE
  ======================================================= */

  if (
    filters.pageSize !==
      undefined
  ) {
    params.set(
      "pageSize",
      String(
        filters.pageSize
      )
    );
  }


  /* =======================================================
     VIEW
  ======================================================= */

  if (
    filters.view
  ) {
    params.set(
      "view",
      filters.view
    );
  }


  /* =======================================================
     URL
  ======================================================= */

  const queryString =
    params.toString();


  const url =
    `${apiUrl(
      "/properties"
    )}${
      queryString
        ? `?${queryString}`
        : ""
    }`;


  console.log(
    "GET PROPERTIES:",
    url
  );


  /* =======================================================
     REQUEST
  ======================================================= */

  const response =
    await fetch(
      url,
      {
        cache:
          "no-store",
      }
    );


  const result =
    await readJson<
      BackendPropertyList
    >(
      response
    );


  /* =======================================================
     RETURN
  ======================================================= */

  return {
    properties:
      Array.isArray(
        result.data
      )
        ? result.data.map(
            (
              property
            ) =>
              normalizeProperty(
                property
              )
          )
        : [],

    pagination:
      result.pagination,
  };
}


/* =========================================================
   GET PROPERTY FILTER OPTIONS
========================================================= */

export async function getPropertyFilterOptions() {
  const response =
    await fetch(
      apiUrl(
        "/properties/filter-options"
      ),
      {
        cache:
          "no-store",
      }
    );


  const result =
    await readJson<
      PropertyFilterResponse
    >(
      response
    );


  return Array.isArray(
    result.data
  )
    ? result.data
    : [];
}


/* =========================================================
   GET BUILDING + UNIT FILTER OPTIONS
========================================================= */

export async function getPropertyBuildingUnitOptions(
  buildingId?: string
) {
  const params =
    new URLSearchParams();


  /* =======================================================
     BUILDING ID
  ======================================================= */

  if (
    buildingId &&
    buildingId
      .trim() !==
      ""
  ) {
    params.set(
      "buildingId",
      buildingId
        .trim()
    );
  }


  const queryString =
    params.toString();


  /* =======================================================
     REQUEST
  ======================================================= */

  const response =
    await fetch(
      `${apiUrl(
        "/properties/building-unit-options"
      )}${
        queryString
          ? `?${queryString}`
          : ""
      }`,
      {
        cache:
          "no-store",
      }
    );


  const result =
    await readJson<
      PropertyBuildingUnitOptionsResponse
    >(
      response
    );


  /* =======================================================
     RETURN
  ======================================================= */

  return {
    buildings:
      Array.isArray(
        result.data
          ?.buildings
      )
        ? result.data
            .buildings
        : [],

    units:
      Array.isArray(
        result.data
          ?.units
      )
        ? result.data
            .units
        : [],
  };
}


/* =========================================================
   GET PROPERTY
========================================================= */

export async function getProperty(
  id: string
) {
  const safeId =
    encodeBuildingId(
      id
    );


  const response =
    await fetch(
      apiUrl(
        `/properties/${safeId}`
      ),
      {
        cache:
          "no-store",
      }
    );


  const result =
    await readJson<{
      success:
        boolean;

      data:
        BackendProperty;
    }>(
      response
    );


  return normalizeProperty(
    result.data
  );
}


/* =========================================================
   GET PROPERTY UNITS
========================================================= */

export async function getPropertyUnits(
  id: string
) {
  const safeId =
    encodeBuildingId(
      id
    );


  const response =
    await fetch(
      apiUrl(
        `/properties/${safeId}/units`
      ),
      {
        cache:
          "no-store",
      }
    );


  const result =
    await readJson<{
      success:
        boolean;

      total:
        number;

      data:
        PropertyUnit[];
    }>(
      response
    );


  return {
    total:
      Number(
        result.total ??
        0
      ),

    units:
      Array.isArray(
        result.data
      )
        ? result.data
        : [],
  };
}
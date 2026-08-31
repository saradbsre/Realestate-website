/* =========================================================
   PROPERTY TYPES
========================================================= */

export interface Property {
  id: string;
  title: string;

  description: string;

  price: number;
  maxPrice: number;

  location: string;

  type: string;
  availableTypes: string;

  purpose: string;
  status: string;

  beds: number;
  baths: number;

  amenities?: string[];

  area: number;
  maxArea: number;

  images: string;

  erpId: string | null;

  vacantUnits: number;

  webDisplayOrder:
  number | null;

  primaryImagePath?:
  string | null;

primaryImageUrl?:
  string | null;
}




export interface PropertyFilters {
  search?: string;

  unitTypeId?:
    | string
    | number;

  beds?: string;

  minPrice?:
    | string
    | number;

  maxPrice?:
    | string
    | number;

  page?: number;

  pageSize?: number;
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

  area: number;

  areaUnit: string;

  annualRent: number;

  maxAnnualRent: number;

  currency: string;

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

  vacant: string;

  isActive: boolean;

  image:
    string | null;

  lastUpdated:
    string | null;
     isWithBalcony:
    number | boolean | null;
}

/* =========================================================
   BACKEND PROPERTY LIST RESPONSE
========================================================= */

interface BackendPropertyList {
  data: BackendProperty[];

  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

/* =========================================================
   BACKEND PROPERTY
========================================================= */

interface BackendProperty {
  id: string;

  title: string;

  buildingType?: string;

  address?: string;

  areaName?: string;

  placeName?: string;

  neighborhood?: string;

  location?: string;

  propertyType?: string;

  availableTypes?: string;

  area?: number;

  maxArea?: number;

  price?: number;

  maxPrice?: number;

  currency?: string;

  rentalPeriod?: string;

  purpose?: string;

  vacantUnits?: number;

  referenceNo?: string;

  primaryImagePath?:
  string | null;

primaryImageUrl?:
  string | null;
}

/* =========================================================
   FILTER OPTIONS
========================================================= */

export interface PropertyFilterType {
  id: number;
  name: string;
}

export interface PropertyFilterCategory {
  categoryId: string;

  categoryName: string;

  types: PropertyFilterType[];
}

interface PropertyFilterResponse {
  success: boolean;

  data: PropertyFilterCategory[];
}

/* =========================================================
   BACKEND URL
========================================================= */

/*
 * Local:
 *
 * NEXT_PUBLIC_API_URL=http://localhost:5000
 *
 * Production:
 *
 * NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

/*
 * Example:
 *
 * apiUrl("/properties")
 *
 * Local:
 * http://localhost:5000/api/properties
 *
 * Production:
 * https://xxx.onrender.com/api/properties
 */
function apiUrl(
  path: string
) {
  if (!API_BASE_URL) {
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
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.error ||
        `API request failed (${response.status})`
    );
  }

  const data = await response.json();

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

    "LABOUR CAMP":
      "Labour Camp",
  };

  if (
    exactMappings[value]
  ) {
    return exactMappings[
      value
    ];
  }

  /*
   * ERP examples:
   *
   * 1 BED ROOM HALL
   * 2 BED ROOM HALL
   * 3 BED ROOM
   */
  const bedroomMatch =
    value.match(
      /^(\d+)\s*BED\s*ROOM(?:\s*HALL)?$/
    );

  if (
    bedroomMatch
  ) {
    return `${bedroomMatch[1]} Bed`;
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
    return `${bedroomMatch2[1]} Bed`;
  }

  return type
    .trim()
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

/* =========================================================
   AVAILABLE TYPES FORMATTER
========================================================= */

function formatAvailableTypes(
  availableTypes?: string
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
        (type) =>
          formatPropertyType(
            type
          )
      )
      .filter(Boolean);

  return [
    ...new Set(
      formatted
    ),
  ].join(", ");
}

/* =========================================================
   NORMALIZE PROPERTY
========================================================= */

function normalizeProperty(
  property: BackendProperty
): Property {
  return {
    id:
      String(
        property.id
      ),

    title:
      property.title ||
      "",

    description:
      "",

    price:
      Number(
        property.price ||
          0
      ),

    maxPrice:
      Number(
        property.maxPrice ??
          property.price ??
          0
      ),

    location:
      property.location ||
      "",

    type:
      formatPropertyType(
        property.propertyType ||
          "Property"
      ),

    availableTypes:
      formatAvailableTypes(
        property.availableTypes ||
          property.propertyType
      ),

    purpose:
      property.purpose ||
      "Rent",

    status:
      "Ready",

    beds:
      0,

    baths:
      0,

    area:
      Number(
        property.area ||
          0
      ),

    maxArea:
      Number(
        property.maxArea ??
          property.area ??
          0
      ),

    images:
      "[]",

    erpId:
      property.referenceNo ||
      null,

    vacantUnits:
      Number(
        property.vacantUnits ||
          0
      ),

    webDisplayOrder:
      null,

    /* ========================================
       CLOUDFLARE BUILDING IMAGE
    ======================================== */

    primaryImagePath:
      property.primaryImagePath ??
      null,

    primaryImageUrl:
      property.primaryImageUrl ??
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

  Object.entries(
    filters
  ).forEach(
    ([key, value]) => {
      if (
        value !==
          undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(
          key,
          String(value)
        );
      }
    }
  );

  const queryString =
    params.toString();

  const url =
    `${
      apiUrl(
        "/properties"
      )
    }${
      queryString
        ? `?${queryString}`
        : ""
    }`;

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
    >(response);

  return {
    properties:
      result.data.map(
        (
          property
        ) =>
          normalizeProperty(
            property
          )
      ),

    pagination:
      result.pagination,
  };
}

/* =========================================================
   GET FILTER OPTIONS
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
    >(response);

  return result.data;
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
      success: boolean;

      data:
        BackendProperty;
    }>(response);

  /*
   * Detail endpoint can return
   * backend format too.
   */
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
    }>(response);

  return {
    total:
      result.total,

    units:
      result.data ||
      [],
  };
}
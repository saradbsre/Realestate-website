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
}
export interface PropertyFilters {
  search?: string;

  unitTypeId?:
    string | number;

  beds?: string;

  minPrice?:
    string | number;

  maxPrice?:
    string | number;

  page?: number;

  pageSize?: number;
}

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
    string | number | null;

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

  vacant:
    string;

  isActive:
    boolean;

  image:
    string | null;

  lastUpdated:
    string | null;
}

/*
 * Response from:
 *
 * GET /api/properties
 */
interface BackendPropertyList {
  data: BackendProperty[];

  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

/*
 * Supports both:
 *
 * Listing API aliases:
 * id, title
 *
 * and current detail API aliases:
 * buildingId, buildingName
 *
 * This lets us migrate the backend gradually without
 * breaking the frontend.
 */
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
}

/*
 * Response row from:
 *
 * GET /api/properties/:id/units
 */
interface BackendUnit {
  referenceNo?: string;

  propertyType?: string;

  unitDescription?: string;

  floorNumber?: string | number;

  area?: number;

  annualRent?: number;

  maximumAnnualRent?: number;

  contractRent?: number;

  numberOfPayments?: number;

  purpose?: string;

  unitAddress?: string;

  unitNature?: string;

  lastUpdated?: string;
}

interface BackendUnits {
  buildingId?: number;

  total?: number;

  units?: BackendUnit[];
}

/*
 * Generates frontend API URL.
 *
 * Client:
 * /api/properties
 *
 * Server component with baseUrl:
 * http://localhost:3005/api/properties
 */
function apiUrl(
  path: string,
  baseUrl = ""
) {
  return `${baseUrl.replace(/\/$/, "")}/api${path}`;
}

/*
 * Common response reader.
 */
async function readJson<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => null);

    throw new Error(
      body?.error ||
        `Property API request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

function formatPropertyType(type: string): string {
  const value = type
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  const exactMappings: Record<string, string> = {
    "STUDIO": "Studio",
    "STUDIO FLAT": "Studio",

    "OFFICE": "Office",
    "OFFICE FLAT": "Office",

    "SHOP": "Shop",

    "SHOWROOM": "Showroom",
    "SHOW ROOM": "Showroom",

    "VILLA": "Villa",

    "WAREHOUSE": "Warehouse",
    "WARE HOUSE": "Warehouse",

    "PENTHOUSE": "Penthouse",

    "DUPLEX": "Duplex",

    "TOWNHOUSE": "Townhouse",
    "TOWN HOUSE": "Townhouse",

    "RETAIL": "Retail",
  };

  if (exactMappings[value]) {
    return exactMappings[value];
  }

  /*
   * 1 BED ROOM HALL
   * 2 BED ROOM HALL
   * 3 BEDROOM HALL
   * 1 BED ROOM
   * etc.
   */
  const bedroomMatch = value.match(
    /^(\d+)\s*BED\s*ROOM(?:\s*HALL)?$/
  );

  if (bedroomMatch) {
    return `${bedroomMatch[1]} BHK`;
  }

  /*
   * Handles:
   * 1 BEDROOM
   * 2 BEDROOM
   * 3 BEDROOM HALL
   */
  const bedroomMatch2 = value.match(
    /^(\d+)\s*BEDROOM(?:\s*HALL)?$/
  );

  if (bedroomMatch2) {
    return `${bedroomMatch2[1]} Bed`;
  }

  /*
   * Fallback:
   * Convert ERP uppercase text into readable title case.
   */
  return type
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatAvailableTypes(
  availableTypes?: string
): string {
  if (!availableTypes) {
    return "";
  }

  const formatted = availableTypes
    .split(",")
    .map((type) =>
      formatPropertyType(type)
    )
    .filter(Boolean);

  /*
   * Remove duplicates after conversion.
   *
   * Example:
   * STUDIO + STUDIO FLAT
   * becomes only:
   * Studio
   */
  return [...new Set(formatted)]
    .join(", ");
}


/*
 * Convert ERP API response into the Property object
 * already expected by your React components.
 */
function normalizeProperty(
  property: BackendProperty
): Property {
  return {
   id: String(property.id),

    title:
      property.title,

    description: "",

    price:
      Number(property.price || 0),

    maxPrice:
      Number(
        property.maxPrice ??
        property.price ??
        0
      ),

    location:
      property.location || "",

 type: formatPropertyType(
  property.propertyType ||
  "Property"
),

availableTypes:
  formatAvailableTypes(
    property.availableTypes ||
    property.propertyType
  ),

    purpose:
      property.purpose || "Rent",

    status: "Ready",

    beds: 0,

    baths: 0,

    area:
      Number(property.area || 0),

    maxArea:
      Number(
        property.maxArea ??
        property.area ??
        0
      ),

    images: "[]",

    erpId:
      property.referenceNo || null,

    vacantUnits:
      Number(
        property.vacantUnits || 0
      ),
  };
}

/*
 * GET /api/properties
 *
 * Search/listing API
 */
export async function getProperties(
  filters: PropertyFilters = {},
  baseUrl = ""
) {
  const params =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
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
    `${apiUrl(
      "/properties",
      baseUrl
    )}${
      queryString
        ? `?${queryString}`
        : ""
    }`;

  const response =
    await fetch(url, {
      cache: "no-store",
    });

  const result =
    await readJson<BackendPropertyList>(
      response
    );

  return {
    properties:
      result.data.map(
        (property) =>
          normalizeProperty(property)
      ),

    pagination:
      result.pagination,
  };
}


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
export async function getPropertyFilterOptions(
  baseUrl = ""
) {
  const response = await fetch(
    apiUrl(
      "/properties/filter-options",
      baseUrl
    ),
    {
      cache: "no-store",
    }
  );

  const result =
    await readJson<PropertyFilterResponse>(
      response
    );

  return result.data;
}
/*
 * GET /api/properties/:id
 *
 * GET /api/properties/:id/units
 *
 * Runs both requests at the same time.
 */
export async function getProperty(
  id: string,
  baseUrl = ""
) {
  const safeId =
    encodeBuildingId(id);

  const response = await fetch(
    apiUrl(
      `/properties/${safeId}`,
      baseUrl
    ),
    {
      cache: "no-store",
    }
  );

  const result =
    await readJson<{
      success: boolean;
      data: Property;
    }>(response);

  return result.data;
}

export async function getPropertyUnits(
  id: string,
  baseUrl = ""
) {
  const safeId =
    encodeBuildingId(id);

  const response = await fetch(
    apiUrl(
      `/properties/${safeId}/units`,
      baseUrl
    ),
    {
      cache: "no-store",
    }
  );

  const result =
    await readJson<{
      success: boolean;
      total: number;
      data: PropertyUnit[];
    }>(response);

  return {
    total: result.total,
    units: result.data,
  };
}
function encodeBuildingId(id: string) {
  let decodedId = id;

  try {
    decodedId = decodeURIComponent(id);
  } catch {
    decodedId = id;
  }

  return encodeURIComponent(
    decodedId.trim()
  );
}


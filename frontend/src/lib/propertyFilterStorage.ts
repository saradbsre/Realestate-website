export interface SavedPropertyFilters {
  location: string;

  unitTypeId:
    | number
    | null;

  beds: string;

  areaRange: string;

  priceRange: string;

  buildingId?: string;

  unitDesc?: string;

  page?: number;
}


const STORAGE_KEY =
  "property_search_filters";


export function savePropertyFilters(
  filters:
    SavedPropertyFilters
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      filters
    )
  );
}


export function getSavedPropertyFilters():
  | SavedPropertyFilters
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }


  const value =
    sessionStorage.getItem(
      STORAGE_KEY
    );


  if (
    !value
  ) {
    return null;
  }


  try {
    return JSON.parse(
      value
    ) as SavedPropertyFilters;
  } catch {
    sessionStorage.removeItem(
      STORAGE_KEY
    );

    return null;
  }
}


export function clearSavedPropertyFilters() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  sessionStorage.removeItem(
    STORAGE_KEY
  );
}
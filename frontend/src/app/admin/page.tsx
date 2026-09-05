"use client";

import React, {
  useEffect,
  useState,
} from "react";

import styles from "./admin.module.css";

import {
  getProperties,
  type Property,
} from "@/lib/propertyApi";
import CommonAlert, {
  type AlertType,
} from "../components/CommonAlert";


import UnitImageManager
  from "./ImageManager/UnitImageManager";


/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   TYPES
========================================================= */
interface UpcomingProject {
  id: string;

  title: string;

  placeId: string;
  placeName: string;

  areaId:
    string | null;

  areaName:
    string | null;

  buildArea:
    number | null;

  image:
    string | null;

  description:
    string | null;

  isUpcomingProject:
    boolean;

  isActive:
    boolean;
}

interface PlaceOption {
  placeId: string;
  placeName: string;
  countryId: string;
}

interface AreaOption {
  areaId: string;
  areaName: string;
  placeId: string;
}

interface PortalUser {
  id: number;
  username: string;
  email: string;
  role: string;
  mfaType: string;
  otpSecret: string | null;
  createdAt: string;
}

interface Booking {
  id: number;

  propertyId: string;

  requestType:
    | "BOOKING"
    | "ENQUIRY";

  propertyName: string;

  unitReference:
    string | null;

  unitType:
    string | null;

  name: string;

  email: string;

  phone: string;

  nationality: string;

  passportFileName:
    string | null;

  passportMimeType:
    string | null;

  passportFileSize:
    number | null;

  hasPassport:
    boolean;

  status: string;

  isAutoRejected:
    boolean;

  declineReason:
    string | null;

  inquiryDepartment:
    string | null;

  enquiryMessage:
    string | null;

  actionId:
    string | null;

  createdAt: string;

  updatedAt:
    string | null;
}

interface NationalityRule {
  id: string;
  nationality: string;
  country: string | null;
  isAutoReject: boolean;
}

interface NationalityOption {
  id: string;
  nationality: string;
  country: string | null;
}

interface AdminProperty {
  id: string;

  title: string;

  location: string;

  webDisplayOrder:
    number | null;
     vacantUnits:
    number;
}

interface PropertyImageUnit {
  unitDesc: string;

  unitType:
    string | null;

  annualRent:
    number | null;

  isVacant:
    boolean;
}

interface BuildImage {
  imageId: number;

  buildingId: string;

  imagePath: string;

  imageUrl:
    string | null;

  fileName:
    string | null;

  fileSize:
    number | null;

  displayOrder: number;

  isPrimary: boolean;
}
/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboard() {
  /* =======================================================
     AUTH
  ======================================================= */

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const [
    userRole,
    setUserRole,
  ] = useState("Viewer");

  const [
    userUsername,
    setUserUsername,
  ] = useState("");

  const [
    usernameInput,
    setUsernameInput,
  ] = useState("");

  const [
    passwordInput,
    setPasswordInput,
  ] = useState("");

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const [
    loggingIn,
    setLoggingIn,
  ] = useState(false);

const [
  availableNationalities,
  setAvailableNationalities,
] = useState<
  NationalityOption[]
>([]);

const [
  selectedNationalityId,
  setSelectedNationalityId,
] = useState("");

const [
  savingNationalityRule,
  setSavingNationalityRule,
] = useState(false);
  /* =======================================================
     ACTIVE TAB
  ======================================================= */
const [
  requestTab,
  setRequestTab,
] = useState<
  "BOOKING" |
  "ENQUIRY"
>("BOOKING");
  const [
  decliningBookingId,
  setDecliningBookingId,
] = useState<number | null>(null);
const [
  declineReason,
  setDeclineReason,
] = useState("");
  const [
    activeTab,
    setActiveTab,
  ] = useState<
    | "welcome"
    | "listings"
    | "upcoming"
      | "images"
    | "sync"
    | "users"
    | "bookings"
    | "nationality-rules"
  >("welcome");

  /* =======================================================
     PROPERTIES
  ======================================================= */
const [
  searchText,
  setSearchText,
] = useState("");
const [
  properties,
  setProperties,
] = useState<
  AdminProperty[]
>([]);
const [
  listingFilter,
  setListingFilter,
] = useState<
  | "all"
  | "top"
  | "normal"
  | "hidden"
>("all");

/* =========================================================
   LISTING COUNTS
========================================================= */

const topPriorityCount =
  properties.filter(
    (property) =>
      property.webDisplayOrder !==
        null &&
      property.webDisplayOrder >=
        1 &&
      property.webDisplayOrder <=
        6
  ).length;

const normalListingCount =
  properties.filter(
    (property) =>
      property.webDisplayOrder ===
      null
  ).length;

const hiddenListingCount =
  properties.filter(
    (property) =>
      property.webDisplayOrder ===
      0
  ).length;

/* =========================================================
   FILTER + SORT LISTINGS
========================================================= */
 

/* =========================================================
   PROPERTY IMAGE MANAGEMENT
========================================================= */

const [
  selectedImageBuildingId,
  setSelectedImageBuildingId,
] = useState("");

const [
  propertyImageUnits,
  setPropertyImageUnits,
] = useState<
  PropertyImageUnit[]
>([]);
const [
  imageManagementTab,
  setImageManagementTab,
] = useState<
  "building" | "unit"
>("building");
const [
  selectedImageUnit,
  setSelectedImageUnit,
] = useState<
  string | null
>(null);

const [
  buildImages,
  setBuildImages,
] = useState<
  BuildImage[]
>([]);

const [
  loadingImageUnits,
  setLoadingImageUnits,
] = useState(false);

const [
  loadingBuildImages,
  setLoadingBuildImages,
] = useState(false);

const [
  uploadingBuildImage,
  setUploadingBuildImage,
] = useState(false);

const [
  buildImageFiles,
  setBuildImageFiles,
] = useState<File[]>(
  []
);

interface ImageBuilding {
  id: string;
  title: string;
  isUpcomingProject: boolean;
  isActive: boolean;
}

const [
  imageBuildings,
  setImageBuildings,
] = useState<
  ImageBuilding[]
>([]);
const [
  draggingBuildImageId,
  setDraggingBuildImageId,
] = useState<
  number | null
>(null);

const [
  buildOrderChanged,
  setBuildOrderChanged,
] = useState(false);

const [
  savingBuildOrder,
  setSavingBuildOrder,
] = useState(false);
const fetchImageBuildings =

  async () => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/properties/image-buildings`,
          {
            cache:
              "no-store",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();
        

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to load buildings."
        );
      }

      setImageBuildings(
        Array.isArray(
          result.data
        )
          ? result.data
          : []
      );
    } catch (error) {
      setImageBuildings([]);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to load buildings."
      );
    }
  };
const handleBuildImageDragStart =
  (
    imageId:
      number
  ) => {
    setDraggingBuildImageId(
      imageId
    );
  };

  const handleBuildImageDragOver =
  (
    event:
      React.DragEvent,

    targetImageId:
      number
  ) => {
    event.preventDefault();

    if (
      draggingBuildImageId ===
        null ||
      draggingBuildImageId ===
        targetImageId
    ) {
      return;
    }

    setBuildImages(
      (current) => {
        const updated =
          [...current];

        const fromIndex =
          updated.findIndex(
            (image) =>
              image.imageId ===
              draggingBuildImageId
          );

        const toIndex =
          updated.findIndex(
            (image) =>
              image.imageId ===
              targetImageId
          );

        if (
          fromIndex === -1 ||
          toIndex === -1
        ) {
          return current;
        }

        const [
          movedImage,
        ] =
          updated.splice(
            fromIndex,
            1
          );

        updated.splice(
          toIndex,
          0,
          movedImage
        );

        return updated.map(
          (
            image,
            index
          ) => ({
            ...image,

            displayOrder:
              index + 1,
          })
        );
      }
    );

    setBuildOrderChanged(
      true
    );
  };


  const handleBuildImageDragEnd =
  () => {
    setDraggingBuildImageId(
      null
    );
  };

  const handleSaveBuildImageOrder =
  async () => {
    if (
      !selectedImageBuildingId ||
      buildImages.length ===
        0
    ) {
      return;
    }

    try {
      setSavingBuildOrder(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/build-images/${encodeURIComponent(
            selectedImageBuildingId
          )}/order`,
          {
            method:
              "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                imageIds:
                  buildImages.map(
                    (image) =>
                      image.imageId
                  ),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to save image order."
        );
      }

      setBuildOrderChanged(
        false
      );

      showSuccess(
        "Image order saved successfully."
      );

      await fetchBuildImages(
        selectedImageBuildingId
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to save image order."
      );
    } finally {
      setSavingBuildOrder(
        false
      );
    }
  };

  const handleSetBuildPrimary =
  async (
    imageId:
      number
  ) => {
    if (
      !selectedImageBuildingId
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/build-images/${encodeURIComponent(
            selectedImageBuildingId
          )}/${imageId}/primary`,
          {
            method:
              "PATCH",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to set primary image."
        );
      }

      setBuildImages(
        (current) =>
          current.map(
            (image) => ({
              ...image,

              isPrimary:
                image.imageId ===
                imageId,
            })
          )
      );

      showSuccess(
        "Primary image updated."
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to set primary image."
      );
    }
  };

const handleDeleteBuildImage =
  (
    image:
      BuildImage
  ) => {
    setAlertConfig({
      open: true,

      type:
        "warning",

      title:
        "Delete Building Image",

      message:
        `Are you sure you want to delete ${
          image.fileName ||
          "this image"
        }?`,

      confirmText:
        "Delete",

      showCancel:
        true,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        () =>
          confirmDeleteBuildImage(
            image
          ),
    });
  };


  const confirmDeleteBuildImage =
  async (
    image:
      BuildImage
  ) => {
    if (
      !selectedImageBuildingId
    ) {
      showError(
        "Building ID is missing."
      );

      return;
    }

    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/build-images/${encodeURIComponent(
            selectedImageBuildingId
          )}/${image.imageId}`,
          {
            method:
              "DELETE",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to delete image."
        );
      }

      await fetchBuildImages(
        selectedImageBuildingId
      );

      showSuccess(
        "Building image deleted successfully."
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to delete image."
      );
    }
  };


const normalizedSearch =
  searchText
    .trim()
    .toLowerCase();
const filteredAndSortedProperties =
  properties
    .filter(
      (property) => {
        /* ===============================================
           DISPLAY FILTER
        =============================================== */

        let matchesDisplay =
          true;

        if (
          listingFilter ===
          "top"
        ) {
          matchesDisplay =
            property.webDisplayOrder !==
              null &&
            property.webDisplayOrder >=
              1 &&
            property.webDisplayOrder <=
              6;
        }

        if (
          listingFilter ===
          "normal"
        ) {
          matchesDisplay =
            property.webDisplayOrder ===
            null;
        }

        if (
          listingFilter ===
          "hidden"
        ) {
          matchesDisplay =
            property.webDisplayOrder ===
            0;
        }

        if (
          !matchesDisplay
        ) {
          return false;
        }

        /* ===============================================
           SEARCH
        =============================================== */

        if (
          !normalizedSearch
        ) {
          return true;
        }

        return [
          property.id,
          property.title,
          property.location,
        ].some(
          (value) =>
            String(
              value || ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              )
        );
      }
    )
    .sort(
      (a, b) => {
        const getBucket = (
          value:
            number | null
        ) => {
          if (
            value !== null &&
            value >= 1 &&
            value <= 6
          ) {
            return 0;
          }

          if (
            value === null
          ) {
            return 1;
          }

          if (
            value === 0
          ) {
            return 2;
          }

          return 3;
        };

        const bucketA =
          getBucket(
            a.webDisplayOrder
          );

        const bucketB =
          getBucket(
            b.webDisplayOrder
          );

        if (
          bucketA !==
          bucketB
        ) {
          return (
            bucketA -
            bucketB
          );
        }

        if (
          bucketA === 0 &&
          a.webDisplayOrder !==
            null &&
          b.webDisplayOrder !==
            null
        ) {
          return (
            a.webDisplayOrder -
            b.webDisplayOrder
          );
        }

        return (
          a.title || ""
        ).localeCompare(
          b.title || ""
        );
      }
    );


    
  const [
    loadingListings,
    setLoadingListings,
  ] = useState(true);

  /* =======================================================
     UPCOMING PROJECTS
  ======================================================= */

  const [
    upcomingProjects,
    setUpcomingProjects,
  ] = useState<
    UpcomingProject[]
  >([]);

  const [
    loadingUpcoming,
    setLoadingUpcoming,
  ] = useState(false);

  /* =======================================================
     BUILDING FORM
  ======================================================= */

  const [
    buildingForm,
    setBuildingForm,
  ] = useState({
    buildId: "",
    buildingName: "",
    placeId: "",
    areaId: "",
    buildArea: "",
  });

  const [
    places,
    setPlaces,
  ] = useState<
    PlaceOption[]
  >([]);

  const [
    areas,
    setAreas,
  ] = useState<
    AreaOption[]
  >([]);

  const [
    loadingPlaces,
    setLoadingPlaces,
  ] = useState(false);

  const [
    loadingAreas,
    setLoadingAreas,
  ] = useState(false);

  const [
    savingBuilding,
    setSavingBuilding,
  ] = useState(false);

  const [
    editingBuildingId,
    setEditingBuildingId,
  ] = useState<
    string | null
  >(null);
const filteredUpcomingProjects =
  upcomingProjects.filter(
    (project) => {
      if (
        !normalizedSearch
      ) {
        return true;
      }

      return [
        project.id,
        project.title,
        project.placeName,
        project.areaName,
      ].some(
        (value) =>
          String(
            value || ""
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }
  );
  /* =======================================================
     USERS
  ======================================================= */

  const [
    portalUsers,
    setPortalUsers,
  ] = useState<
    PortalUser[]
  >([]);
const filteredPortalUsers =
  portalUsers.filter(
    (user) => {
      if (
        !normalizedSearch
      ) {
        return true;
      }

      return [
        user.username,
        user.email,
        user.role,
        user.mfaType,
      ].some(
        (value) =>
          String(
            value || ""
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }
  );
  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(false);

  const [
    userForm,
    setUserForm,
  ] = useState({
    username: "",
    password: "",
    email: "",
    role: "Editor",
    mfaType: "Email OTP",
  });

  const [
    savingUser,
    setSavingUser,
  ] = useState(false);

  /* =======================================================
     BOOKINGS
  ======================================================= */
const [
  nationalityRules,
  setNationalityRules,
] = useState<
  NationalityRule[]
>([]);


const filteredNationalityRules =
  nationalityRules.filter(
    (rule) => {
      if (
        !normalizedSearch
      ) {
        return true;
      }

      return [
        rule.id,
        rule.nationality,
        rule.country,
      ].some(
        (value) =>
          String(
            value || ""
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }
  );
  const [
    bookings,
    setBookings,
  ] = useState<
    Booking[]
  >([]);
const filteredBookings =
  bookings.filter(
    (booking) => {
      if (
        !normalizedSearch
      ) {
        return true;
      }

      return [
        booking.id,
        booking.propertyId,
        booking.propertyName,
        booking.unitReference,
        booking.unitType,
        booking.name,
        booking.email,
        booking.phone,
        booking.nationality,
        booking.status,
      ].some(
        (value) =>
          String(
            value || ""
          )
            .toLowerCase()
            .includes(
              normalizedSearch
            )
      );
    }
  );
  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<
    Booking | null
  >(null);
const [
  alertConfig,
  setAlertConfig,
] = useState<{
  open: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  showCancel: boolean;
  inputRequired: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  inputValue: string;
  loading: boolean;
  onConfirm:
    (() => void) |
    null;
}>({
  open: false,

  type:
    "confirm",

  title:
    "",

  message:
    "",

  confirmText:
    "OK",

  showCancel:
    false,

  inputRequired:
    false,

  inputLabel:
    "",

  inputPlaceholder:
    "",

  inputValue:
    "",

  loading:
    false,

  onConfirm:
    null,
});
const closeAlert = () => {
  setDeclineReason("");

  setDecliningBookingId(
    null
  );

  setAlertConfig(
    (current) => ({
      ...current,

      open: false,

      loading: false,

      inputValue: "",

      onConfirm: null,
    })
  );
};



const clearAlert = () => {
  setAlertConfig((current) => ({
    ...current,

    open: false,

    title: "",

    message: "",

    loading: false,

    inputRequired: false,

    inputValue: "",

    onConfirm: null,
  }));
};


  const showSuccess =
  (
    message:
      string
  ) => {
    setAlertConfig({
      open: true,

      type:
        "success",

      title:
        "Success",

      message,

      confirmText:
        "OK",

      showCancel:
        false,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        closeAlert,
    });
  };
  const showError =
  (
    message:
      string
  ) => {
    setAlertConfig({
      open: true,

      type:
        "error",

      title:
        "Error",

      message,

      confirmText:
        "Close",

      showCancel:
        false,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        closeAlert,
    });
  };
  /* =======================================================
     NATIONALITY RULES
  ======================================================= */

  

  /* =======================================================
     MESSAGES
  ======================================================= */

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    syncing,
    setSyncing,
  ] = useState(false);

  /* =======================================================
     TEMP LOGIN
  ======================================================= */

 const handleLoginSubmit = async (
  event:
    React.FormEvent
) => {
  event.preventDefault();

  setLoginError("");
  setLoggingIn(true);

  try {
    const username =
      usernameInput.trim();

    const password = passwordInput;

    if (!username) {
      setLoginError(
        "Please enter username."
      );

      return;
    }

    if (!password) {
      setLoginError(
        "Please enter password."
      );

      return;
    }

    const response = await fetch("/api/admin-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (!response.ok) {
      setLoginError(result.error || "Unable to log in.");
      return;
    }

    setIsAuthenticated(
      true
    );

    setUserRole(
      "Super Admin"
    );

    setUserUsername(
      result.username
    );

    setPasswordInput(
      ""
    );

    setLoginError(
      ""
    );
  } catch {
    setLoginError("Unable to log in. Please try again.");
  } finally {
    setLoggingIn(
      false
    );
  }
};

const handleLogout = async () => {
  await fetch("/api/admin-auth/logout", { method: "POST" });

  setIsAuthenticated(false);

  setUserRole("Viewer");

  setUserUsername("");

  setUsernameInput("");

  setPasswordInput("");

  changeTab("welcome");

  setStatusMessage("");
  setErrorMessage("");
};

useEffect(() => {
  let active = true;

  const restoreSession = async () => {
    try {
      const response = await fetch("/api/admin-auth/session", {
        cache: "no-store",
      });
      const result = await response.json();

      if (active && response.ok && result.authenticated) {
        setIsAuthenticated(true);
        setUserUsername(result.username);
        setUserRole(result.role);
      }
    } catch {
      // A missing or unavailable session leaves the user on the login screen.
    } finally {
      if (active) setCheckingAuth(false);
    }
  };

  restoreSession();
  return () => {
    active = false;
  };
}, []);

  /* =======================================================
     FETCH PROPERTIES
  ======================================================= */

 const fetchProperties =
  async () => {
    try {
      setLoadingListings(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/properties`,
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
            "Unable to load property listings."
        );
      }

      setProperties(
        Array.isArray(
          result.data
        )
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Property load failed:",
        error
      );

      setProperties([]);

      showError(
        error instanceof Error
          ? error.message
          : "Failed to load property listings."
      );
    } finally {
      setLoadingListings(
        false
      );
    }
  };


 const handleWebDisplayChange =
  async (
    property:
      AdminProperty,
    value:
      string
  ) => {
    try {
      const webDisplayOrder =
        value === "normal"
          ? null
          : Number(value);

      /* ===================================================
         FRONTEND DUPLICATE PRIORITY CHECK
      =================================================== */

      if (
        webDisplayOrder !==
          null &&
        webDisplayOrder >=
          1 &&
        webDisplayOrder <=
          6
      ) {
        const existing =
          properties.find(
            (
              item
            ) =>
              item.id !==
                property.id &&
              item.webDisplayOrder ===
                webDisplayOrder
          );

        if (existing) {
          showError(
            `Top Priority ${webDisplayOrder} is already assigned to ${existing.title}.`
          );

          return;
        }
      }

      /* ===================================================
         API UPDATE
      =================================================== */

      const response =
        await fetch(
          `${API_URL}/api/admin/properties/${encodeURIComponent(
            property.id
          )}/web-display`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                webDisplayOrder,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update website display."
        );
      }

      /* ===================================================
         UPDATE LOCAL STATE IMMEDIATELY
      =================================================== */

      setProperties(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              property.id
                ? {
                    ...item,

                    webDisplayOrder,
                  }
                : item
          )
      );

      /* ===================================================
         SUCCESS
      =================================================== */

      if (
        webDisplayOrder ===
        null
      ) {
        showSuccess(
          "Building set as Normal Listing."
        );
      } else if (
        webDisplayOrder ===
        0
      ) {
        showSuccess(
          "Building hidden from website."
        );
      } else {
        showSuccess(
          `Building set as Top Priority ${webDisplayOrder}.`
        );
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to update website display."
      );
    }
  };

  /* =======================================================
     FETCH PLACES
  ======================================================= */

  const fetchPlaces =
    async () => {
      try {
        setLoadingPlaces(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/upcoming-projects/places`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to load places."
          );
        }

        setPlaces(
          Array.isArray(
            result.data
          )
            ? result.data
            : []
        );
      } catch (error) {
        console.error(
          "Place load failed:",
          error
        );

        setPlaces(
          []
        );

        showError(
          error instanceof
            Error
            ? error.message
            : "Unable to load places."
        );
      } finally {
        setLoadingPlaces(
          false
        );
      }
    };

  /* =======================================================
     AREA LOAD
  ======================================================= */

  useEffect(() => {
    if (
      !buildingForm.placeId
    ) {
      setAreas(
        []
      );

      return;
    }

    let cancelled =
      false;

    async function loadAreas() {
      try {
        setLoadingAreas(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/upcoming-projects/areas?placeId=${encodeURIComponent(
              buildingForm.placeId
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to load areas."
          );
        }

        if (
          cancelled
        ) {
          return;
        }

        const loadedAreas:
          AreaOption[] =
          Array.isArray(
            result.data
          )
            ? result.data
            : [];

        setAreas(
          loadedAreas
        );

        /*
         * Keep selected Area during EDIT
         * if it still belongs to the Place.
         */

        setBuildingForm(
          (
            current
          ) => {
            if (
              !current.areaId
            ) {
              return current;
            }

            const valid =
              loadedAreas.some(
                (
                  area
                ) =>
                  area.areaId ===
                  current.areaId
              );

            if (
              valid
            ) {
              return current;
            }

            return {
              ...current,
              areaId: "",
            };
          }
        );
      } catch (error) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "Area load failed:",
          error
        );

        setAreas(
          []
        );

        showError(
          error instanceof
            Error
            ? error.message
            : "Unable to load areas."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoadingAreas(
            false
          );
        }
      }
    }

    loadAreas();

    return () => {
      cancelled =
        true;
    };
  }, [
    buildingForm.placeId,
  ]);
useEffect(() => {
  if (!statusMessage && !errorMessage) {
    return;
  }

  const timer = window.setTimeout(() => {
    setStatusMessage("");
    setErrorMessage("");
  }, 4000);

  return () => {
    window.clearTimeout(timer);
  };
}, [statusMessage, errorMessage]);
  /* =======================================================
     FETCH UPCOMING PROJECTS
  ======================================================= */
const changeTab = (
  tab:
    | "welcome"
    | "listings"
    | "upcoming"
      | "images"
    | "sync"
    | "users"
    | "bookings"
    | "nationality-rules"
) => {
  setActiveTab(tab);

  setSearchText("");

  closeAlert();

  setStatusMessage("");
  setErrorMessage("");
   if (tab !== "images") {
    setSelectedImageUnit(
      null
    );
  }
};


  const fetchUpcomingProjects =
    async () => {
      try {
        setLoadingUpcoming(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/upcoming-projects`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to load upcoming buildings."
          );
        }

        setUpcomingProjects(
          Array.isArray(
            result.data
          )
            ? result.data
            : []
        );
      } catch (error) {
        console.error(
          "Upcoming building load failed:",
          error
        );

        setUpcomingProjects(
          []
        );

        showError(
          error instanceof
            Error
            ? error.message
            : "Unable to load upcoming buildings."
        );
      } finally {
        setLoadingUpcoming(
          false
        );
      }
    };

  /* =======================================================
     INITIAL LOAD AFTER LOGIN
  ======================================================= */

  useEffect(() => {
    if (
      !isAuthenticated
    ) {
      return;
    }

    fetchProperties();
    fetchUpcomingProjects();
    fetchPlaces();
  }, [
    isAuthenticated,
  ]);

  /* =======================================================
     OPEN UPCOMING TAB
  ======================================================= */

const openUpcomingTab = () => {
  changeTab("upcoming");

  fetchUpcomingProjects();

  if (places.length === 0) {
    fetchPlaces();
  }
};
  /* =======================================================
     RESET BUILDING FORM
  ======================================================= */

  const resetBuildingForm =
    () => {
      setBuildingForm({
        buildId: "",
        buildingName:
          "",
        placeId: "",
        areaId: "",
        buildArea: "",
      });

      setAreas(
        []
      );

      setEditingBuildingId(
        null
      );
    };

  /* =======================================================
     ADD / UPDATE UPCOMING BUILDING
  ======================================================= */

  const handleAddBuildingSubmit =
    async (
      event:
        React.FormEvent
    ) => {
     event.preventDefault();

clearAlert();

      const buildId =
        buildingForm.buildId.trim();

      const buildingName =
        buildingForm.buildingName.trim();

      const placeId =
        buildingForm.placeId.trim();

      const areaId =
        buildingForm.areaId.trim();

      if (
        !buildId
      ) {
        showError(
          "Building ID is required."
        );

        return;
      }

      if (
        buildId.length >
        7
      ) {
        showError(
          "Building ID cannot exceed 7 characters."
        );

        return;
      }

      if (
        !buildingName
      ) {
        showError(
          "Building name is required."
        );

        return;
      }

      if (
        !placeId
      ) {
        showError(
          "Please select a place."
        );

        return;
      }

      if (
        !areaId
      ) {
        showError(
          "Please select an area."
        );

        return;
      }

      if (
        buildingForm.buildArea &&
        (
          !Number.isFinite(
            Number(
              buildingForm.buildArea
            )
          ) ||
          Number(
            buildingForm.buildArea
          ) <= 0
        )
      ) {
        showError(
          "Sq.Ft. must be a valid number."
        );

        return;
      }

      const isEditing =
        editingBuildingId !==
        null;

      try {
        setSavingBuilding(
          true
        );

        const url =
          isEditing
            ? `${API_URL}/api/upcoming-projects/${encodeURIComponent(
                editingBuildingId
              )}`
            : `${API_URL}/api/upcoming-projects`;

        const response =
          await fetch(
            url,
            {
              method:
                isEditing
                  ? "PUT"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  buildId,

                  buildingName,

                  placeId,

                  areaId,

                  buildArea:
                    buildingForm.buildArea ||
                    null,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to save upcoming building."
          );
        }

        showSuccess(
          isEditing
            ? "Upcoming building updated successfully."
            : "Upcoming building added successfully."
        );

        resetBuildingForm();

        await fetchUpcomingProjects();
      } catch (error) {
        console.error(
          "Save upcoming building failed:",
          error
        );

        showError(
          error instanceof
            Error
            ? error.message
            : "Unable to save upcoming building."
        );
      } finally {
        setSavingBuilding(
          false
        );
      }
    };

  /* =======================================================
     EDIT UPCOMING BUILDING
  ======================================================= */

  const handleEditUpcomingProject =
    (
      project:
        UpcomingProject
    ) => {
         clearAlert();
      setEditingBuildingId(
        project.id
      );

      setBuildingForm({
        buildId:
          project.id,

        buildingName:
          project.title,

        placeId:
          project.placeId,

        areaId:
          project.areaId ||
          "",

        buildArea:
          project.buildArea !==
          null
            ? String(
                project.buildArea
              )
            : "",
      });

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };

  /* =======================================================
     SOFT DELETE UPCOMING BUILDING
     Backend should set:
     IsUpcomingProject = 0
  ======================================================= */

const handleDeleteUpcomingProject =
  (
    buildId:
      string
  ) => {
    setAlertConfig({
      open: true,

      type:
        "warning",

      title:
        "Remove Upcoming Project",

      message:
        "Are you sure you want to remove this building from Upcoming Projects?",

      confirmText:
        "Remove",

      showCancel:
        true,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        () =>
          confirmDeleteUpcomingProject(
            buildId
          ),
    });
  };

  const confirmDeleteUpcomingProject =
  async (
    buildId:
      string
  ) => {
    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      const response =
        await fetch(
          `${API_URL}/api/upcoming-projects/${encodeURIComponent(
            buildId
          )}`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to remove upcoming building."
        );
      }

      if (
        editingBuildingId ===
        buildId
      ) {
        resetBuildingForm();
      }

      await fetchUpcomingProjects();

      showSuccess(
        "Building removed from Upcoming Projects successfully."
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to remove upcoming building."
      );
    }
  };

  /* =======================================================
     USERS
  ======================================================= */

  const fetchPortalUsers =
    async () => {
      if (
        userRole !==
        "Super Admin"
      ) {
        return;
      }

      try {
        setLoadingUsers(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/admin/users`,
            {
              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Failed to load portal users."
          );
        }

        const result =
          await response.json();

        setPortalUsers(
          Array.isArray(
            result
          )
            ? result
            : result.data ||
                []
        );
      } catch (error) {
        console.error(
          error
        );
      } finally {
        setLoadingUsers(
          false
        );
      }
    };

    
    const handleRequestTabChange =
  (
    type:
      "BOOKING" |
      "ENQUIRY"
  ) => {
    setRequestTab(
      type
    );

    setSearchText(
      ""
    );

    setSelectedBooking(
      null
    );

    fetchBookings(
      type
    );
  };

  /* =======================================================
     BOOKINGS
  ======================================================= */

const fetchBookings =
  async (
    requestType:
      "BOOKING" |
      "ENQUIRY" =
        requestTab
  ) => {
    if (
      userRole !==
      "Super Admin"
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/bookings?requestType=${encodeURIComponent(
            requestType
          )}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            `Unable to load ${
              requestType ===
              "BOOKING"
                ? "booking"
                : "enquiry"
            } requests.`
        );
      }

      setBookings(
        Array.isArray(
          result.data
        )
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Request load failed:",
        error
      );

      setBookings([]);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to load requests."
      );
    }
  };
const requestBookingConfirmation =
  (
    bookingId:
      number
  ) => {
    setAlertConfig({
      open: true,

      type:
        "confirm",

      title:
        "Confirm Booking",

      message:
        "Are you sure you want to confirm this booking?",

      confirmText:
        "Confirm",

      showCancel:
        true,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        () =>
          updateBookingStatus(
            bookingId,
            "Confirmed",
            null
          ),
    });
  };
  
const requestBookingDecline = (
  bookingId: number
) => {
  setDecliningBookingId(
    bookingId
  );

  setDeclineReason("");

  setAlertConfig({
    open: true,

    type: "warning",

    title: "Decline Booking",

    message:
      "Please enter the reason for declining this booking.",

    confirmText: "Decline",

    showCancel: true,

    inputRequired: true,

    inputLabel:
      "Decline Reason",

    inputPlaceholder:
      "Enter reason...",

    inputValue: "",

    loading: false,

    /*
     * DON'T store decline function here.
     */
    onConfirm: null,
  });
};

const submitBookingDecline = async () => {
  const reason =
    declineReason.trim();

  console.log(
    "Declining booking:",
    decliningBookingId
  );

  console.log(
    "Decline reason:",
    reason
  );

  if (
    decliningBookingId ===
    null
  ) {
    showError(
      "Booking ID is missing."
    );

    return;
  }

  if (!reason) {
    showError(
      "Please enter a reason for declining the booking."
    );

    return;
  }

  await updateBookingStatus(
    decliningBookingId,
    "Declined",
    reason
  );
};

  const confirmBookingDecline =
  (
    bookingId:
      number
  ) => {
    const reason =
      alertConfig.inputValue.trim();

    if (
      !reason
    ) {
      return;
    }

    updateBookingStatus(
      bookingId,
      "Declined",
      reason
    );
  };
  const updateBookingStatus =
  async (
    bookingId:
      number,

    status:
      | "Confirmed"
      | "Declined",

    reason:
      string | null
  ) => {
    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/bookings/${bookingId}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
                reason,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to update booking."
        );
      }

   setSelectedBooking(null);

setDecliningBookingId(null);

setDeclineReason("");
      await fetchBookings();

      showSuccess(
        status ===
          "Confirmed"
          ? "Booking confirmed successfully."
          : "Booking declined successfully."
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to update booking."
      );
    }
  };

  /* =======================================================
     NATIONALITY RULES
  ======================================================= */

const fetchNationalityRules = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/admin/nationality-rules`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Unable to load auto-rejection nationalities."
      );
    }

    setNationalityRules(
      Array.isArray(result.data)
        ? result.data
        : []
    );
  } catch (error) {
    console.error(
      "Nationality rules load failed:",
      error
    );

    setNationalityRules([]);

    showError(
      error instanceof Error
        ? error.message
        : "Unable to load auto-rejection nationalities."
    );
  }
};

const fetchAvailableNationalities = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/admin/nationality-rules/available`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Unable to load available nationalities."
      );
    }

    setAvailableNationalities(
      Array.isArray(result.data)
        ? result.data
        : []
    );
  } catch (error) {
    console.error(
      "Available nationality load failed:",
      error
    );

    setAvailableNationalities([]);

    showError(
      error instanceof Error
        ? error.message
        : "Unable to load available nationalities."
    );
  }
};

const handleAddNationalityRule = async (
  event: React.FormEvent
) => {
  event.preventDefault();

  if (!selectedNationalityId) {
    showError(
      "Please select a nationality."
    );

    return;
  }

  try {
    setSavingNationalityRule(true);
      clearAlert();

    const response = await fetch(
      `${API_URL}/api/admin/nationality-rules`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          nationId:
            selectedNationalityId,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Unable to add nationality."
      );
    }

    const selected =
      availableNationalities.find(
        (item) =>
          item.id ===
          selectedNationalityId
      );

    setSelectedNationalityId("");

    showSuccess(
      selected
        ? `${selected.nationality} added to auto rejection.`
        : "Nationality added to auto rejection."
    );

    await Promise.all([
      fetchNationalityRules(),
      fetchAvailableNationalities(),
    ]);
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Unable to add nationality."
    );
  } finally {
    setSavingNationalityRule(false);
  }
};
const handleRemoveNationalityRule =
  (
    rule:
      NationalityRule
  ) => {
    setAlertConfig({
      open: true,

      type:
        "warning",

      title:
        "Remove Auto-Rejection Rule",

      message:
        `Remove ${rule.nationality} from auto rejection?`,

      confirmText:
        "Remove",

      showCancel:
        true,

      inputRequired:
        false,

      inputLabel:
        "",

      inputPlaceholder:
        "",

      inputValue:
        "",

      loading:
        false,

      onConfirm:
        () =>
          confirmRemoveNationalityRule(
            rule
          ),
    });
  };
 const confirmRemoveNationalityRule =
  async (
    rule:
      NationalityRule
  ) => {
    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/nationality-rules/${encodeURIComponent(
            rule.id
          )}`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ||
            "Unable to remove nationality."
        );
      }

      await Promise.all([
        fetchNationalityRules(),
        fetchAvailableNationalities(),
      ]);

      showSuccess(
        `${rule.nationality} removed from auto rejection.`
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to remove nationality."
      );
    }
  };
  /* =======================================================
     SYNC ERP
  ======================================================= */

  const handleSyncErp =
    async () => {
      try {
        setSyncing(
          true
        );

        showSuccess(
          "Syncing with ERP..."
        );

        showError(
          ""
        );

        const response =
          await fetch(
            `${API_URL}/api/sync`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "ERP sync failed."
          );
        }

        showSuccess(
          "ERP synchronization completed successfully."
        );

        await fetchProperties();
      } catch (error) {
        showSuccess(
          ""
        );

        showError(
          error instanceof
            Error
            ? error.message
            : "ERP sync failed."
        );
      } finally {
        setSyncing(
          false
        );
      }
    };
/* =========================================================
   PROPERTY IMAGES
========================================================= */

const fetchBuildImages =
  async (
    buildingId:
      string
  ) => {
    if (!buildingId) {
      setBuildImages([]);

      return;
    }

    try {
      setLoadingBuildImages(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/build-images/${encodeURIComponent(
            buildingId
          )}`,
          {
            cache:
              "no-store",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to load building images."
        );
      }

      setBuildImages(
        Array.isArray(
          result.data
        )
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Building image load failed:",
        error
      );

      setBuildImages([]);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to load building images."
      );
    } finally {
      setLoadingBuildImages(
        false
      );
    }
  };


const fetchPropertyImageUnits =
  async (buildingId: string) => {
    if (!buildingId) {
      setPropertyImageUnits([]);
      return;
    }

    try {
      setLoadingImageUnits(true);

      const response =
        await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(
            buildingId
          )}/units`,
          {
            cache: "no-store",
            credentials: "include",
          }
        );

      const result =
        await response.json();

      console.log(
        "UNIT API RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load units."
        );
      }

      const rawUnits: {
        referenceNo?: string;
        unitName?: string;
        propertyType?: string;
        description?: string;
        annualRent?: number | null;
        vacant?: string | null;
        unitReference?: string | null;
      }[] =
        Array.isArray(result.data)
          ? result.data
          : [];

      console.log(
        "RAW UNITS:",
        rawUnits
      );

      const mappedUnits:
        PropertyImageUnit[] =
        rawUnits
          .map(
            (
              unit
            ): PropertyImageUnit => ({
              /*
               * IMPORTANT:
               * description = dbo.unit.unit_desc
               *
               * This is your unique unit
               * identifier within building.
               */
              unitDesc:
                String(
                  unit.description ||
                    ""
                ).trim(),

              /*
               * Prefer actual property type.
               * Fall back to unitName.
               */
              unitType:
                unit.propertyType
                  ? String(
                      unit.propertyType
                    ).trim()
                  : unit.unitName
                  ? String(
                      unit.unitName
                    ).trim()
                  : null,

              annualRent:
                unit.annualRent !==
                  null &&
                unit.annualRent !==
                  undefined
                  ? Number(
                      unit.annualRent
                    )
                  : null,

              isVacant:
                String(
                  unit.vacant ||
                    ""
                )
                  .trim()
                  .toUpperCase() ===
                "Y",
            })
          )
          .filter(
            (
              unit
            ) =>
              unit.unitDesc !==
              ""
          );

      console.log(
        "MAPPED UNITS:",
        mappedUnits
      );

      setPropertyImageUnits(
        mappedUnits
      );
    } catch (error) {
      console.error(
        "Unit load failed:",
        error
      );

      setPropertyImageUnits([]);

      showError(
        error instanceof Error
          ? error.message
          : "Unable to load units."
      );
    } finally {
      setLoadingImageUnits(false);
    }
  };

const handleImageBuildingChange =
  async (
    buildingId: string
  ) => {
    setSelectedImageBuildingId(
      buildingId
    );

    setImageManagementTab(
      "building"
    );

    setSelectedImageUnit(
      null
    );

    setBuildImageFiles(
      []
    );

    setPropertyImageUnits(
      []
    );

    setBuildImages(
      []
    );

    setBuildOrderChanged(
      false
    );

    setDraggingBuildImageId(
      null
    );

    if (!buildingId) {
      return;
    }

    await Promise.all([
      fetchBuildImages(
        buildingId
      ),

      fetchPropertyImageUnits(
        buildingId
      ),
    ]);
  };


const handleBuildImageUpload =
  async () => {
    if (
      !selectedImageBuildingId
    ) {
      showError(
        "Please select a building."
      );

      return;
    }

    if (
      buildImageFiles.length ===
      0
    ) {
      showError(
        "Please select at least one image."
      );

      return;
    }

    const invalidFile =
      buildImageFiles.find(
        (file) =>
          file.size >
          5 *
            1024 *
            1024
      );

    if (invalidFile) {
      showError(
        `${invalidFile.name} exceeds the 5 MB limit.`
      );

      return;
    }

    try {
      setUploadingBuildImage(
        true
      );

      const formData =
        new FormData();

      buildImageFiles.forEach(
        (file) => {
          formData.append(
            "images",
            file
          );
        }
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/build-images/${encodeURIComponent(
            selectedImageBuildingId
          )}/upload`,
          {
            method: "POST",

            credentials:
              "include",

            body: formData,
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to upload building images."
        );
      }

      setBuildImageFiles(
        []
      );

      await fetchBuildImages(
        selectedImageBuildingId
      );

      showSuccess(
        `${
          result.data?.length ??
          buildImageFiles.length
        } building image(s) uploaded successfully.`
      );
    } catch (error) {
      console.error(
        "Building upload failed:",
        error
      );

      showError(
        error instanceof Error
          ? error.message
          : "Unable to upload building images."
      );
    } finally {
      setUploadingBuildImage(
        false
      );
    }
  };


const formatImageFileSize =
  (
    bytes:
      number | null
  ) => {
    if (!bytes) {
      return "";
    }

    if (
      bytes >=
      1024 * 1024
    ) {
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(
        2
      )} MB`;
    }

    return `${(
      bytes / 1024
    ).toFixed(
      0
    )} KB`;
  };
  /* =======================================================
     FORMAT AREA
  ======================================================= */

  const formatArea = (
    area:
      number | null
  ) => {
    if (
      area === null ||
      Number(area) <=
        0
    ) {
      return "-";
    }

    return `${Number(
      area
    ).toLocaleString(
      "en-AE"
    )} Sq.Ft.`;
  };

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    checkingAuth
  ) {
    return (
      <div
        className={
          styles.loginWrapper
        }
      >
        <div
          className={
            styles.loginCard
          }
        >
          Loading...
        </div>
      </div>
    );
  }

  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    !isAuthenticated
  ) {
    return (
      <div
        className={
          styles.loginWrapper
        }
      >
        <div
          className={
            styles.loginCard
          }
        >
          <img
            src="/bin-shabib-group.webp"
            alt="Bin Shabib Real Estate"
            className={
              styles.loginLogo
            }
          />

          <h2>
            Admin Portal
          </h2>

          <p>
            Enter the
            administrator
            username to
            continue.
          </p>

          {loginError && (
            <div
              className={
                styles.statusError
              }
            >
              {loginError}
            </div>
          )}

          <form
            onSubmit={
              handleLoginSubmit
            }
          >
            <div
              className={
                styles.formGroup
              }
            >
              <label
                className={
                  styles.label
                }
              >
                Username
              </label>

              <input
                type="text"
                value={
                  usernameInput
                }
                onChange={(
                  event
                ) =>
                  setUsernameInput(
                    event.target
                      .value
                  )
                }
                placeholder="admin"
                className={
                  styles.input
                }
                required
              />
            </div>

            <div
              className={
                styles.formGroup
              }
              style={{
                marginTop:
                  "16px",
              }}
            >
              <label
                className={
                  styles.label
                }
              >
                Password
              </label>

              <input
                type="password"
                value={
                  passwordInput
                }
                onChange={(
                  event
                ) =>
                  setPasswordInput(
                    event.target
                      .value
                  )
                }
                placeholder="Enter Password"
                className={
                  styles.input
                }
                 required
              />
            </div>

            <button
              type="submit"
              disabled={
                loggingIn
              }
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{
                width:
                  "100%",

                marginTop:
                  "24px",

                padding:
                  "12px",
              }}
            >
              {loggingIn
                ? "Opening..."
                : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }



  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div
      className={
        styles.dashboardWrapper
      }
    >
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={
          styles.sidebar
        }
      >
        <div
          className={
            styles.sidebarHeader
          }
        >
         

          <div
            className={
              styles.sidebarTitle
            }
          >
            Realestate Admin Portal
          </div>

          <div
            className={
              styles.sidebarSub
            }
          >
            Role:{" "}
            {userRole}
          </div>
        </div>

        <nav
          className={
            styles.sidebarMenu
          }
        >
          <button
            type="button"
           onClick={() => {
  changeTab("welcome");
}}
            className={`${styles.menuItem} ${
              activeTab ===
              "welcome"
                ? styles.menuItemActive
                : ""
            }`}
          >
             Welcome &
            stats
          </button>

          <button
            type="button"
           onClick={() => {
  changeTab("listings");

  fetchProperties();
}}
            className={`${styles.menuItem} ${
              activeTab ===
              "listings"
                ? styles.menuItemActive
                : ""
            }`}
          >
             Active Listings
            {/* ({properties.length}) */}
          </button>

          <button
            type="button"
            onClick={
              openUpcomingTab
            }
            className={`${styles.menuItem} ${
              activeTab ===
              "upcoming"
                ? styles.menuItemActive
                : ""
            }`}
          >
             Upcoming Projects 
             {/* (
            {
              upcomingProjects.length
            }
            ) */}
          </button>

  <button
  type="button"
  onClick={() => {
    changeTab(
      "images"
    );

    fetchImageBuildings();
  }}
  className={`${styles.menuItem} ${
    activeTab ===
    "images"
      ? styles.menuItemActive
      : ""
  }`}
>
  Property Images
</button>

          {/* <button
            type="button"
           onClick={() => {
  changeTab("sync");
}}
            className={`${styles.menuItem} ${
              activeTab ===
              "sync"
                ? styles.menuItemActive
                : ""
            }`}
          >
             Sync ERP
            Database
          </button> */}

          {userRole ===
            "Super Admin" && (
            <>
              {/* <button
                type="button"
                onClick={() => {
                 changeTab("users");

                  fetchPortalUsers();
                }}
                className={`${styles.menuItem} ${
                  activeTab ===
                  "users"
                    ? styles.menuItemActive
                    : ""
                }`}
              >
                👥 Portal Users
                (
                {
                  portalUsers.length
                }
                )
              </button> */}

              <button
                type="button"
                onClick={() => {
  changeTab(
    "bookings"
  );

  setRequestTab(
    "BOOKING"
  );

  fetchBookings(
    "BOOKING"
  );
}}
                className={`${styles.menuItem} ${
                  activeTab ===
                  "bookings"
                    ? styles.menuItemActive
                    : ""
                }`}
              >
              Booking
                Requests 
                {/* (
                {
                  bookings.length
                }
                ) */}
              </button>

             <button
  type="button"
 onClick={() => {
  changeTab("nationality-rules");

  fetchNationalityRules();
  fetchAvailableNationalities();
}}
  className={`${styles.menuItem} ${
    activeTab ===
    "nationality-rules"
      ? styles.menuItemActive
      : ""
  }`}
>
   Nationality Rules 
   {/* ({filteredNationalityRules.length}) */}
</button>
            </>
          )}
        </nav>

        <div
          className={
            styles.sidebarFooter
          }
        >
          <div
            style={{
              padding:
                "0 16px 12px",

              fontSize:
                "11px",

              color:
                "rgba(255,255,255,.45)",
            }}
          >
            Logged in as:{" "}
            <strong>
              {userUsername}
            </strong>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className={
              styles.menuItem
            }
            style={{
              color:
                "#f87171",
            }}
          >
            🚪 Log Out
            Session
          </button>

          
        </div>
      </aside>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main
        className={
          styles.contentArea
        }
      >
        {[
  "listings",
  "upcoming",
  "users",
  "bookings",
  "nationality-rules",
].includes(
  activeTab
) && (
  <div
    className={
      styles.adminSearchBar
    }
  >
    <div
      className={
        styles.adminSearchInputWrapper
      }
    >
      <span
        className={
          styles.adminSearchIcon
        }
      >
        🔍
      </span>

      <input
        type="search"
        value={
          searchText
        }
        onChange={(
          event
        ) =>
          setSearchText(
            event.target
              .value
          )
        }
        placeholder={
        "Search..."
        }
        className={
          styles.adminSearchInput
        }
      />

      {searchText && (
        <button
          type="button"
          onClick={() =>
            setSearchText(
              ""
            )
          }
          className={
            styles.adminSearchClear
          }
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  </div>
)}
        {statusMessage && (
          <div
            className={
              styles.statusBanner
            }
          >
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div
            className={
              styles.statusError
            }
          >
            {errorMessage}
          </div>
        )}

        {/* =================================================
            WELCOME
        ================================================= */}

        {activeTab ===
          "welcome" && (
          <div>
            <div
              className={
                styles.contentHeader
              }
            >
              <div>
                <h2>
                  Dashboard Home
                </h2>

                <p>
                  Welcome,{" "}
                  {userUsername}.
                  Access Level:{" "}
                  {userRole}
                </p>
              </div>
            </div>

            <div
              className={
                styles.welcomeBanner
              }
            >
              <h3>
                ABDULWAHED BIN
                SHABIB REAL ESTATE
                L.L.C
              </h3>

              <p>
                Manage active
                property listings,
                upcoming projects,
                bookings and
                administrative
                settings.
              </p>
            </div>

            <div
              className={
                styles.statsGrid
              }
            >
              <div
                className={
                  styles.statCard
                }
              >
                <div
                  className={
                    styles.statIcon
                  }
                >
                  🏢
                </div>

                <div
                  className={
                    styles.statInfo
                  }
                >
                  <div
                    className={
                      styles.statTitle
                    }
                  >
                    Active
                    Properties
                  </div>

                  <div
                    className={
                      styles.statValue
                    }
                  >
                    {
                      properties.length
                    }
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.statCard
                }
              >
                <div
                  className={
                    styles.statIcon
                  }
                >
                  🏗️
                </div>

                <div
                  className={
                    styles.statInfo
                  }
                >
                  <div
                    className={
                      styles.statTitle
                    }
                  >
                    Upcoming
                    Projects
                  </div>

                  <div
                    className={
                      styles.statValue
                    }
                  >
                    {
                      upcomingProjects.length
                    }
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.statCard
                }
              >
                <div
                  className={
                    styles.statIcon
                  }
                >
                  👥
                </div>

                <div
                  className={
                    styles.statInfo
                  }
                >
                  <div
                    className={
                      styles.statTitle
                    }
                  >
                    Access
                  </div>

                  <div
                    className={
                      styles.statValue
                    }
                    style={{
                      fontSize:
                        "14px",
                    }}
                  >
                    {userRole}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            ACTIVE LISTINGS
        ================================================= */}
{/* =================================================
    ACTIVE LISTINGS
================================================= */}

{activeTab ===
  "listings" && (
  <div>
    {/* =============================================
        HEADER
    ============================================= */}

    <div
      className={
        styles.contentHeader
      }
    >
      <div>
        <h2>
          Active Listings (
          {properties.length})
        </h2>

      
      </div>
    </div>

    {/* =============================================
        FILTERS
    ============================================= */}

    <div
      className={
        styles.listingFilterBar
      }
    >
      <button
        type="button"
        onClick={() =>
          setListingFilter(
            "all"
          )
        }
        className={`${styles.listingFilterBtn} ${
          listingFilter ===
          "all"
            ? styles.listingFilterActive
            : ""
        }`}
      >
        All
        <span
          className={
            styles.listingFilterCount
          }
        >
          {properties.length}
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          setListingFilter(
            "top"
          )
        }
        className={`${styles.listingFilterBtn} ${
          listingFilter ===
          "top"
            ? styles.listingFilterActive
            : ""
        }`}
      >
        Top Priority
        <span
          className={
            styles.listingFilterCount
          }
        >
          {
            topPriorityCount
          }
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          setListingFilter(
            "normal"
          )
        }
        className={`${styles.listingFilterBtn} ${
          listingFilter ===
          "normal"
            ? styles.listingFilterActive
            : ""
        }`}
      >
        Normal Listing
        <span
          className={
            styles.listingFilterCount
          }
        >
          {
            normalListingCount
          }
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          setListingFilter(
            "hidden"
          )
        }
        className={`${styles.listingFilterBtn} ${
          listingFilter ===
          "hidden"
            ? styles.listingFilterActive
            : ""
        }`}
      >
        Hidden
        <span
          className={
            styles.listingFilterCount
          }
        >
          {
            hiddenListingCount
          }
        </span>
      </button>
    </div>

    {/* =============================================
        LIST
    ============================================= */}

    {loadingListings ? (
      <div
        className={
          styles.loading
        }
      >
        Loading properties...
      </div>
    ) : (
      <div
        className={
          styles.tableCard
        }
      >
        <div
          className={
            styles.tableHeader
          }
        >
          <div>
              BUILDING
          </div>

          <div
            className={
              styles.tableHeaderCount
            }
          >
            Showing{" "}
            {
              filteredAndSortedProperties.length
            }{" "}
            of{" "}
            {
              properties.length
            }
          </div>
        </div>

        {filteredAndSortedProperties.length ===
        0 ? (
          <div
            className={
              styles.emptyListings
            }
          >
            No properties found
            for this filter.
          </div>
        ) : (
          filteredAndSortedProperties.map(
            (
              property
            ) => {
              const currentPriority =
                property.webDisplayOrder;

              return (
                <div
                  key={
                    property.id
                  }
                  className={
                    styles.listingRow
                  }
                >
                  {/* ===============================
                      PROPERTY DETAILS
                  =============================== */}

                  <div
                    className={
                      styles.listingMain
                    }
                  >
                    <div
                      className={
                        styles.listingTitle
                      }
                    >
                      {
                        property.title
                      }
                    </div>

                    <div
                      className={
                        styles.listingLocation
                      }
                    >
                      {
                        property.location
                      }
                    </div>
                    <div
  className={
    styles.vacantUnitInfo
  }
>
  {property.vacantUnits}{" "}
  {property.vacantUnits === 1
    ? "Vacant Unit"
    : "Vacant Units"}
</div>
                  </div>

                  {/* ===============================
                      CONTROLS
                  =============================== */}

                  <div
                    className={
                      styles.listingControls
                    }
                  >
                    {/* PRIORITY BADGE */}

                    {currentPriority !==
                      null &&
                      currentPriority >=
                        1 &&
                      currentPriority <=
                        6 && (
                        <span
                          className={
                            styles.priorityBadge
                          }
                        >
                          #
                          {
                            currentPriority
                          }
                        </span>
                      )}

                    {/* HIDDEN BADGE */}

                    {currentPriority ===
                      0 && (
                      <span
                        className={
                          styles.hiddenBadge
                        }
                      >
                        Hidden
                      </span>
                    )}

                    {/* NORMAL BADGE */}

                    {currentPriority ===
                      null && (
                      <span
                        className={
                          styles.normalBadge
                        }
                      >
                        Normal
                      </span>
                    )}

                    {/* DISPLAY DROPDOWN */}

                    <div
                      className={
                        styles.webDisplayGroup
                      }
                    >
                      <label>
                        Website
                        Display
                      </label>

                      <select
                        value={
                          currentPriority ===
                          null
                            ? "normal"
                            : String(
                                currentPriority
                              )
                        }
                        onChange={(
                          event
                        ) =>
                          handleWebDisplayChange(
                            property,
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          styles.webDisplaySelect
                        }
                      >
                        <option value="normal">
                          Normal
                          Listing
                        </option>

                        <option value="0">
                          Hide from
                          Website
                        </option>

                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                        ].map(
                          (
                            priority
                          ) => {
                            const usedBy =
                              properties.find(
                                (
                                  item
                                ) =>
                                  item.id !==
                                    property.id &&
                                  item.webDisplayOrder ===
                                    priority
                              );

                            return (
                              <option
                                key={
                                  priority
                                }
                                value={
                                  priority
                                }
                                disabled={
                                  Boolean(
                                    usedBy
                                  )
                                }
                              >
                                Top
                                Priority{" "}
                                {
                                  priority
                                }
                                {usedBy
                                  ? " - Used"
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>

                      <div
                        className={
                          styles.displayHint
                        }
                      >
                        {currentPriority ===
                        null
                          ? "Normal listing"
                          : currentPriority ===
                            0
                          ? "Hidden from website"
                          : `Top Priority ${currentPriority}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )
        )}
      </div>
    )}
  </div>
)}

        {/* =================================================
            UPCOMING PROJECTS
        ================================================= */}

        {activeTab ===
          "upcoming" && (
          <div>
            <div
              className={
                styles.contentHeader
              }
            >
              <div>
                <h2>
                  {editingBuildingId
                    ? "Edit Upcoming Building"
                    : "Add Upcoming Buildings"}
                </h2>

                <p>
                  {editingBuildingId
                    ? `Editing building ${editingBuildingId}`
                    : "Create a new upcoming building"}
                </p>
              </div>
            </div>

            {/* =============================================
                FORM
            ============================================= */}

            <form
              onSubmit={
                handleAddBuildingSubmit
              }
              className={
                styles.form
              }
            >
              <div
                className={
                  styles.formRow
                }
              >
                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label
                    className={
                      styles.label
                    }
                  >
                    Building ID *
                  </label>

                  <input
                    type="text"
                    value={
                      buildingForm.buildId
                    }
                    onChange={(
                      event
                    ) =>
                      setBuildingForm(
                        (
                          current
                        ) => ({
                          ...current,

                          buildId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="e.g. P:895"
                    maxLength={
                      7
                    }
                    required
                    disabled={
                      editingBuildingId !==
                      null
                    }
                    className={
                      styles.input
                    }
                  />
                </div>

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label
                    className={
                      styles.label
                    }
                  >
                    Building Name
                    *
                  </label>

                  <input
                    type="text"
                    value={
                      buildingForm.buildingName
                    }
                    onChange={(
                      event
                    ) =>
                      setBuildingForm(
                        (
                          current
                        ) => ({
                          ...current,

                          buildingName:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Enter building name"
                    required
                    className={
                      styles.input
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.formRow
                }
              >
                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label
                    className={
                      styles.label
                    }
                  >
                    Place *
                  </label>

                  <select
                    value={
                      buildingForm.placeId
                    }
                    onChange={(
                      event
                    ) =>
                      setBuildingForm(
                        (
                          current
                        ) => ({
                          ...current,

                          placeId:
                            event
                              .target
                              .value,

                          areaId:
                            "",
                        })
                      )
                    }
                    required
                    disabled={
                      loadingPlaces
                    }
                    className={
                      styles.select
                    }
                  >
                    <option value="">
                      {loadingPlaces
                        ? "Loading places..."
                        : "Select place"}
                    </option>

                    {places.map(
                      (
                        place
                      ) => (
                        <option
                          key={
                            place.placeId
                          }
                          value={
                            place.placeId
                          }
                        >
                          {
                            place.placeName
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label
                    className={
                      styles.label
                    }
                  >
                    Area *
                  </label>

                  <select
                    value={
                      buildingForm.areaId
                    }
                    onChange={(
                      event
                    ) =>
                      setBuildingForm(
                        (
                          current
                        ) => ({
                          ...current,

                          areaId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    required
                    disabled={
                      !buildingForm.placeId ||
                      loadingAreas
                    }
                    className={
                      styles.select
                    }
                  >
                    <option value="">
                      {!buildingForm.placeId
                        ? "Select place first"
                        : loadingAreas
                        ? "Loading areas..."
                        : "Select area"}
                    </option>

                    {areas.map(
                      (
                        area
                      ) => (
                        <option
                          key={
                            area.areaId
                          }
                          value={
                            area.areaId
                          }
                        >
                          {
                            area.areaName
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div
                className={
                  styles.formRow
                }
              >
                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label
                    className={
                      styles.label
                    }
                  >
                    Building Area
                    (Sq.Ft.)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      buildingForm.buildArea
                    }
                    onChange={(
                      event
                    ) =>
                      setBuildingForm(
                        (
                          current
                        ) => ({
                          ...current,

                          buildArea:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Enter Sq.Ft."
                    className={
                      styles.input
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.submitRow
                }
              >
                {editingBuildingId && (
                  <button
                    type="button"
                    onClick={
                      resetBuildingForm
                    }
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={
                    savingBuilding
                  }
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {savingBuilding
                    ? editingBuildingId
                      ? "Updating..."
                      : "Saving..."
                    : editingBuildingId
                    ? "Update Building"
                    : "Add Building"}
                </button>
              </div>
            </form>

            {/* =============================================
                UPCOMING BUILDINGS TABLE
            ============================================= */}

            <div
              className={
                styles.tableCard
              }
              style={{
                marginTop:
                  "28px",
              }}
            >
              <div
                className={
                  styles.tableHeader
                }
              >
                Upcoming Buildings
                (
                {
                  upcomingProjects.length
                }
                )
              </div>

              {loadingUpcoming ? (
                <div
                  className={
                    styles.loading
                  }
                >
                  Loading upcoming
                  buildings...
                </div>
              ) : filteredUpcomingProjects.length ===
                0 ? (
                <div
                  className={
                    styles.loading
                  }
                >
                  No upcoming
                  buildings found.
                </div>
              ) : (
                <div
                  style={{
                    width:
                      "100%",

                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    className={
                      styles.upcomingTable
                    }
                  >
                    <thead>
                      <tr>
                        <th>
                          Building ID
                        </th>

                        <th>
                          Building Name
                        </th>

                        <th>
                          Place
                        </th>

                        <th>
                          Area
                        </th>

                        <th>
                          Sq.Ft.
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUpcomingProjects.map(
                        (
                          project
                        ) => (
                          <tr
                            key={
                              project.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  project.id
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                project.title
                              }
                            </td>

                            <td>
                              {
                                project.placeName ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                project.areaName ||
                                "-"
                              }
                            </td>

                            <td>
                              {formatArea(
                                project.buildArea
                              )}
                            </td>

                            <td>
                              <span
                                className={`${styles.badge} ${styles.badgeErp}`}
                              >
                                Upcoming
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  gap:
                                    "8px",

                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditUpcomingProject(
                                      project
                                    )
                                  }
                                  className={`${styles.btn} ${styles.btnSecondary}`}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteUpcomingProject(
                                      project.id
                                    )
                                  }
                                  className={`${styles.btn} ${styles.btnDanger}`}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}


{/* =================================================
    PROPERTY IMAGES
================================================= */}

{activeTab ===
  "images" && (
  <div>
    {/* =============================================
        HEADER
    ============================================= */}

    <div
      className={
        styles.contentHeader
      }
    >
      <div>
        <h2>
          Property Images
        </h2>

       
      </div>
    </div>


    {/* =============================================
        BUILDING SELECTOR
    ============================================= */}

    <div
      className={
        styles.imageManagementCard
      }
    >
      <div
        className={
          styles.imageSelectorHeader
        }
      >
        <div>
          <h3>
            Select Building
          </h3>

       
        </div>
      </div>

      <select
        value={
          selectedImageBuildingId
        }
        onChange={(
          event
        ) =>
          handleImageBuildingChange(
            event.target.value
          )
        }
        className={
          styles.imageBuildingSelect
        }
      >
        <option value="">
          Select Building
        </option>

      {imageBuildings.map(
  (
    building
  ) => (
    <option
      key={
        building.id
      }
      value={
        building.id
      }
    >
      {building.title}
      {" ("}
      {building.id}
      {")"}

      {building.isUpcomingProject
        ? " - Upcoming"
        : ""}
    </option>
  )
)}
      </select>
    </div>


    {!selectedImageBuildingId ? (
      <div
        className={
          styles.imageEmptyState
        }
      >
       

        <h3>
          Select a Building
        </h3>

        <p>
          Select a building
          above to upload
          building images and
          manage unit images.
        </p>
      </div>
    ) : (
      <>
      <div
  className={
    styles.imageTabs
  }
>
  <button
    type="button"
    onClick={() => {
      setImageManagementTab(
        "building"
      );

      setSelectedImageUnit(
        null
      );
    }}
    className={`${styles.imageTabButton} ${
      imageManagementTab ===
      "building"
        ? styles.imageTabButtonActive
        : ""
    }`}
  >
    

    <span>
      Building Images
    </span>


  </button>


  <button
    type="button"
    onClick={() =>
      setImageManagementTab(
        "unit"
      )
    }
    className={`${styles.imageTabButton} ${
      imageManagementTab ===
      "unit"
        ? styles.imageTabButtonActive
        : ""
    }`}
  >
   

    <span>
      Unit Images
    </span>

    <span
      className={
        styles.imageTabCount
      }
    >
      {
        propertyImageUnits.length
      }
    </span>
  </button>
</div>
        {/* =========================================
            BUILDING IMAGES
        ========================================= */}
{imageManagementTab ===
  "building" && (
        <div
          className={
            styles.imageManagementCard
          }
        >
          <div
            className={
              styles.imageSectionHeader
            }
          >
            <div>
              <h3>
                Building Images
              </h3>

              <p>
                Upload images
                for the selected
                building.
              </p>
            </div>

            <span
              className={
                styles.imageCountBadge
              }
            >
              {
                buildImages.length
              }{" "}
              Images
            </span>
          </div>


          <div
            className={
              styles.buildImageUploadRow
            }
          >
           <input
  type="file"

  multiple

  accept="image/jpeg,image/png,image/webp"

  onChange={(event) => {
    const files =
      Array.from(
        event.target.files ||
          []
      );

    setBuildImageFiles(
      files
    );
  }}

  className={
    styles.imageFileInput
  }
/>

            <button
  type="button"

  onClick={
    handleBuildImageUpload
  }

  disabled={
    uploadingBuildImage ||
    buildImageFiles.length ===
      0
  }

  className={`${styles.btn} ${styles.btnPrimary}`}
>
  {uploadingBuildImage
    ? "Uploading..."
    : buildImageFiles.length >
      0
    ? `Upload ${buildImageFiles.length} Image${
        buildImageFiles.length >
        1
          ? "s"
          : ""
      }`
    : "Upload Building Images"}
</button>
          </div>

          <div
            className={
              styles.imageUploadHint
            }
          >
            JPG, PNG or WebP.
            Maximum file size:
            5 MB.
          </div>
{buildImages.length >
  1 && (
  <div
    className={
      styles.imageOrderToolbar
    }
  >
    <span>
      Drag images to change
      display order.
    </span>

    <button
      type="button"

      onClick={
        handleSaveBuildImageOrder
      }

      disabled={
        !buildOrderChanged ||
        savingBuildOrder
      }

      className={`${styles.btn} ${styles.btnPrimary}`}
    >
      {savingBuildOrder
        ? "Saving..."
        : "Save Order"}
    </button>
  </div>
)}

          {/* BUILDING IMAGE PREVIEW */}

          {loadingBuildImages ? (
            <div
              className={
                styles.imageLoading
              }
            >
              Loading building
              images...
            </div>
          ) : buildImages.length ===
            0 ? (
            <div
              className={
                styles.imageSmallEmpty
              }
            >
              No building images
              uploaded.
            </div>
          ) : (
            <div
              className={
                styles.buildImageGrid
              }
            >
            {buildImages.map(
  (
    image,
    index
  ) => (
    <div
      key={
        image.imageId
      }

      draggable

      onDragStart={() =>
        handleBuildImageDragStart(
          image.imageId
        )
      }

      onDragOver={(
        event
      ) =>
        handleBuildImageDragOver(
          event,
          image.imageId
        )
      }

      onDragEnd={
        handleBuildImageDragEnd
      }

      className={`${styles.buildImageCard} ${
        draggingBuildImageId ===
        image.imageId
          ? styles.buildImageDragging
          : ""
      }`}
    >
      {/* DRAG HANDLE */}

      <div
       
      >
        
      </div>

      {/* IMAGE */}

      <div
        className={
          styles.buildImagePreview
        }
      >
        {image.imageUrl ? (
          <img
            src={
              image.imageUrl
            }

            alt={
              image.fileName ||
              "Building image"
            }

            draggable={
              false
            }
          />
        ) : (
          <div>
            Image unavailable
          </div>
        )}

        {/* ORDER */}

        <span
          className={
            styles.imageOrderBadge
          }
        >
          #{index + 1}
        </span>

        {/* PRIMARY BADGE */}

        {image.isPrimary && (
          <span
            className={
              styles.imagePrimaryBadge
            }
          >
            Primary
          </span>
        )}
      </div>


      {/* IMAGE DETAILS */}

      <div
        className={
          styles.buildImageInfo
        }
      >
        <strong>
          {image.fileName ||
            "Building Image"}
        </strong>

        <span>
          {formatImageFileSize(
            image.fileSize
          )}
        </span>
      </div>


      {/* ACTIONS */}

      <div
        className={
          styles.buildImageActions
        }
      >
        <button
          type="button"

          disabled={
            image.isPrimary
          }

          onClick={(
            event
          ) => {
            event.stopPropagation();

            handleSetBuildPrimary(
              image.imageId
            );
          }}

          className={
            styles.imagePrimaryButton
          }
        >
          {image.isPrimary
            ? "Primary Image"
            : "Set Primary"}
        </button>


        <button
          type="button"

          onClick={(
            event
          ) => {
            event.stopPropagation();

            handleDeleteBuildImage(
              image
            );
          }}

          className={
            styles.imageDeleteButton
          }
        >
          Delete
        </button>
      </div>
    </div>
  )
)}
            </div>
          )}
        </div>
)}

        {/* =========================================
            UNIT IMAGES
        ========================================= */}

      {imageManagementTab ===
  "unit" && (
  <div
    className={
      styles.imageManagementCard
    }
  >
    {/* HEADER */}

    <div
      className={
        styles.imageSectionHeader
      }
    >
      <div>
        <h3>
          Unit Images
        </h3>

        <p>
          Select a unit and manage
          its images.
        </p>
      </div>

      <span
        className={
          styles.imageCountBadge
        }
      >
        {
          propertyImageUnits.length
        }{" "}
        Units
      </span>
    </div>


    {/* UNIT SELECTOR */}

    {loadingImageUnits ? (
      <div
        className={
          styles.imageLoading
        }
      >
        Loading units...
      </div>
    ) : propertyImageUnits.length ===
      0 ? (
      <div
        className={
          styles.imageSmallEmpty
        }
      >
        No units found for
        this building.
      </div>
    ) : (
      <>
        <div
          className={
            styles.unitSelectorPanel
          }
        >
          <div
            className={
              styles.unitSelectorHeading
            }
          >
            <div>
              <strong>
                Select Unit
              </strong>

              <span>
                Choose a unit to
                upload or manage
                images.
              </span>
            </div>
          </div>

          <select
            value={
              selectedImageUnit ||
              ""
            }
            onChange={(
              event
            ) =>
              setSelectedImageUnit(
                event.target
                  .value ||
                  null
              )
            }
            className={
              styles.unitImageSelect
            }
          >
            <option value="">
              Select Unit
            </option>

            {propertyImageUnits.map(
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
                  {unit.unitDesc}

                  {unit.unitType
                    ? ` - ${unit.unitType}`
                    : ""}

                  {unit.annualRent !==
                    null
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


        {/* NOTHING SELECTED */}

        {!selectedImageUnit && (
          <div
            className={
              styles.unitSelectEmpty
            }
          >
        

            <strong>
              Select a Unit
            </strong>

            <p>
              Choose a unit above
              to manage its images.
            </p>
          </div>
        )}


        {/* SELECTED UNIT */}

        {selectedImageUnit &&
          (() => {
            const unit =
              propertyImageUnits.find(
                (
                  item
                ) =>
                  item.unitDesc ===
                  selectedImageUnit
              );

            if (!unit) {
              return null;
            }

            return (
              <>
                <div
                  className={
                    styles.selectedUnitSummary
                  }
                >
                 

                  <div
                    className={
                      styles.selectedUnitContent
                    }
                  >
                    <div
                      className={
                        styles.selectedUnitTitle
                      }
                    >
                      Unit{" "}
                      {
                        unit.unitDesc
                      }
                    </div>

                    <div
                      className={
                        styles.selectedUnitMeta
                      }
                    >
                      {unit.unitType && (
                        <span>
                          {
                            unit.unitType
                          }
                        </span>
                      )}

                      {unit.annualRent !==
                        null && (
                        <span>
                          AED{" "}
                          {Number(
                            unit.annualRent
                          ).toLocaleString(
                            "en-AE"
                          )}{" "}
                          / Year
                        </span>
                      )}

                      <span
                        className={
                          unit.isVacant
                            ? styles.imageVacantBadge
                            : styles.imageOccupiedBadge
                        }
                      >
                        {unit.isVacant
                          ? "Vacant"
                          : "Occupied"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageUnit(
                        null
                      )
                    }
                    className={
                      styles.changeUnitButton
                    }
                  >
                    Change Unit
                  </button>
                </div>


                <div
                  className={
                    styles.unitImageManagerWrapper
                  }
                >
                  <UnitImageManager
                    buildingId={
                      selectedImageBuildingId
                    }
                    unitDesc={
                      unit.unitDesc
                    }
                  />
                </div>
              </>
            );
          })()}
      </>
    )}
  </div>
)}
      </>
    )}
  </div>
)}
        {/* =================================================
            SYNC
        ================================================= */}

        {activeTab ===
          "sync" && (
          <div>
            <div
              className={
                styles.contentHeader
              }
            >
              <div>
                <h2>
                  Sync Properties
                  from ERP
                </h2>

                <p>
                  Refresh the
                  property listing
                  data from the ERP
                  database.
                </p>
              </div>
            </div>

            <div
              className={
                styles.welcomeBanner
              }
            >
              <h3>
                ERP Data
                Integration
              </h3>

              <button
                type="button"
                onClick={
                  handleSyncErp
                }
                disabled={
                  syncing
                }
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {syncing
                  ? "Synchronizing..."
                  : "🔄 Execute ERP Sync"}
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            USERS
        ================================================= */}

        {activeTab ===
          "users" && (
          <div>
            <div
              className={
                styles.contentHeader
              }
            >
              <div>
                <h2>
                  Portal User
                  Accounts
                </h2>

                <p>
                  Administrative
                  user management.
                </p>
              </div>
            </div>

            {loadingUsers ? (
              <div
                className={
                  styles.loading
                }
              >
                Loading users...
              </div>
            ) : (
              <div
                className={
                  styles.tableCard
                }
              >
                <div
                  className={
                    styles.tableHeader
                  }
                >
                  Portal Users
                </div>

                {portalUsers.length ===
                0 ? (
                  <div
                    className={
                      styles.loading
                    }
                  >
                    No users found.
                  </div>
                ) : (
                 filteredPortalUsers.map(
                    (
                      user
                    ) => (
                      <div
                        key={
                          user.id
                        }
                       className={
  styles.listingRow
}
                      >
                        <div>
                          <strong>
                            {
                              user.username
                            }
                          </strong>

                          <div
                            className={
                              styles.propLoc
                            }
                          >
                            {
                              user.email
                            }
                          </div>
                        </div>

                        <div>
                          {
                            user.role
                          }
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            BOOKINGS
        ================================================= */}
{activeTab === "bookings" && (
  <div>
    <div className={styles.contentHeader}>
      <div>
        <h2>
          Customer Requests
        </h2>

        <p>
             Review booking and
      enquiry requests
      received from the
      website.
        </p>
      </div>
    </div>
<div
  className={
    styles.requestTabs
  }
>
  <button
    type="button"

    onClick={() =>
      handleRequestTabChange(
        "BOOKING"
      )
    }

    className={`${styles.requestTabButton} ${
      requestTab ===
      "BOOKING"
        ? styles.requestTabActive
        : ""
    }`}
  >
    Booking Requests

    {requestTab ===
      "BOOKING" && (
      <span>
        {
          bookings.length
        }
      </span>
    )}
  </button>


  <button
    type="button"

    onClick={() =>
      handleRequestTabChange(
        "ENQUIRY"
      )
    }

    className={`${styles.requestTabButton} ${
      requestTab ===
      "ENQUIRY"
        ? styles.requestTabActive
        : ""
    }`}
  >
    Enquiries

    {requestTab ===
      "ENQUIRY" && (
      <span>
        {
          bookings.length
        }
      </span>
    )}
  </button>
</div>
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
         {requestTab ===
  "BOOKING"
    ? "Web Booking Requests"
    : "Web Enquiries"}
      </div>

    {filteredBookings.length ===
0 ? (
  <div
    className={
      styles.loading
    }
  >
    {requestTab ===
    "BOOKING"
      ? "No booking requests found."
      : "No enquiries found."}
  </div>
) : (
      <div className={styles.bookingTableScroll}>
  <table className={styles.bookingTable}>
    <thead>
      <tr>
        <th>Booking ID</th>
        <th>Property</th>
        <th>Unit</th>
        <th>Customer</th>
        <th>Nationality</th>
        <th>Contact</th>
        <th>Passport</th>
        <th>Submitted</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>
                      #{booking.id}
                    </strong>
                  </td>

                  <td>
                    <div className={styles.tablePrimaryText}>
                      {booking.propertyName}
                    </div>

                    {booking.propertyId && (
                      <div className={styles.tableSecondaryText}>
                        {booking.propertyId}
                      </div>
                    )}
                  </td>

                  <td>
                    {booking.unitReference || booking.unitType ? (
                      <>
                        {booking.unitReference && (
                          <div className={styles.tablePrimaryText}>
                            {booking.unitReference}
                          </div>
                        )}

                        {booking.unitType && (
                          <div className={styles.tableSecondaryText}>
                            {booking.unitType}
                          </div>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <div className={styles.tablePrimaryText}>
                      {booking.name}
                    </div>
                  </td>

                  <td>
                    {booking.nationality || "-"}
                  </td>

                  <td>
                    <div className={styles.tablePrimaryText}>
                      {booking.email}
                    </div>

                    <div className={styles.tableSecondaryText}>
                      {booking.phone}
                    </div>
                  </td>

                  <td>
                    {booking.hasPassport ? (
                      <a
                        href={`${API_URL}/api/admin/bookings/${booking.id}/passport`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.passportLink}
                      >
                        View Passport
                      </a>
                    ) : (
                      <span className={styles.noPassport}>
                        Not Uploaded
                      </span>
                    )}
                  </td>

                  <td>
                    {new Date(
                      booking.createdAt
                    ).toLocaleDateString("en-AE")}
                  </td>

                  <td>
                    <span
                      className={`${styles.bookingStatus} ${
                        booking.status === "Confirmed"
                          ? styles.bookingConfirmed
                          : booking.status === "Declined"
                          ? styles.bookingDeclined
                          : styles.bookingPending
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td>
                    <div className={styles.bookingTableActions}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBooking(booking)
                        }
                        className={`${styles.btn} ${styles.btnSecondary}`}
                      >
                        View
                      </button>

                       {requestTab ===
  "BOOKING" &&
  booking.status ===
    "Pending" && (
                        <>
                          <button
                            type="button"
                           onClick={() =>
  requestBookingConfirmation(
    booking.id
  )
}
                            className={`${styles.btn} ${styles.btnPrimary}`}
                          >
                            Confirm
                          </button>

                          <button
                            type="button"
                          onClick={() =>
  requestBookingDecline(
    booking.id
  )
}
                            className={`${styles.btn} ${styles.btnDanger}`}
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

        {/* =================================================
            NATIONALITY
        ================================================= */}

{activeTab === "nationality-rules" && (
  <div>
    {/* =============================================
        HEADER
    ============================================= */}

    <div className={styles.contentHeader}>
      <div>
        <h2>
          Nationality Auto-Rejection
        </h2>

        <p>
          Configure nationalities that should
          automatically decline new web bookings.
        </p>
      </div>
    </div>

    {/* =============================================
        ADD AUTO-REJECT NATIONALITY
    ============================================= */}

    <div
      className={styles.form}
      style={{
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          color: "#0b1a30",
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        Add Auto-Rejection Nationality
      </h3>

      <form
        onSubmit={
          handleAddNationalityRule
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            className={
              styles.formGroup
            }
            style={{
              flex: "1 1 420px",
            }}
          >
            <label
              className={
                styles.label
              }
            >
              Nationality *
            </label>

            <select
              className={
                styles.select
              }
              value={
                selectedNationalityId
              }
              onChange={(event) =>
                setSelectedNationalityId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select nationality
              </option>

              {availableNationalities.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nationality}
                    {item.country
                      ? ` - ${item.country}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={
              savingNationalityRule ||
              !selectedNationalityId
            }
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{
              minHeight: "39px",
            }}
          >
            {savingNationalityRule
              ? "Adding..."
              : "Add Auto Reject"}
          </button>
        </div>

        {availableNationalities.length ===
          0 && (
          <div
            style={{
              marginTop: "10px",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            No additional nationalities are
            available for auto rejection.
          </div>
        )}
      </form>
    </div>

    {/* =============================================
        CURRENT AUTO-REJECT RULES
    ============================================= */}

    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        Auto-Rejection Nationalities (
        {filteredNationalityRules.length})
      </div>

      {filteredNationalityRules.length ===
      0 ? (
        <div className={styles.loading}>
          No auto-rejection nationalities
          configured.
        </div>
      ) : (
        <div
          className={
            styles.nationalityTableScroll
          }
        >
          <table
            className={
              styles.nationalityTable
            }
          >
            <thead>
              <tr>
                <th>Nationality ID</th>
                <th>Nationality</th>
                <th>Country</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredNationalityRules.map(
                (rule) => (
                  <tr key={rule.id}>
                    <td>
                      <strong>
                        {rule.id}
                      </strong>
                    </td>

                    <td>
                      {rule.nationality}
                    </td>

                    <td>
                      {rule.country ||
                        "-"}
                    </td>

                    <td>
                      <span
                        className={`${styles.nationalityRuleStatus} ${styles.nationalityRejected}`}
                      >
                        Auto Reject
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveNationalityRule(
                            rule
                          )
                        }
                        className={`${styles.btn} ${styles.btnDanger}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}
      </main>

      {/* ===================================================
          BOOKING DETAILS
      =================================================== */}

 {selectedBooking && (
  <div
    className={
      styles.bookingModalBackdrop
    }
  >
    <div
      className={
        styles.bookingDetailModal
      }
    >
      <button
        type="button"
        className={
          styles.closeBookingModal
        }
        onClick={() =>
          setSelectedBooking(
            null
          )
        }
        aria-label="Close"
      >
        ×
      </button>

      <div
        className={
          styles.bookingDetailHeader
        }
      >
       <span>
  {selectedBooking.requestType ===
  "ENQUIRY"
    ? "Enquiry"
    : "Booking"}{" "}
  #{selectedBooking.id}
</span>

        <h2>
          {
            selectedBooking.propertyName
          }
        </h2>

        <p>
          Submitted{" "}
          {new Date(
            selectedBooking.createdAt
          ).toLocaleString(
            "en-AE"
          )}
        </p>
      </div>

      {/* STATUS */}

      <div
        style={{
          marginTop:
            "10px",
        }}
      >
        <span
          className={`${styles.bookingStatus} ${
            selectedBooking.status ===
            "Confirmed"
              ? styles.bookingConfirmed
              : selectedBooking.status ===
                "Declined"
              ? styles.bookingDeclined
              : styles.bookingPending
          }`}
        >
          {
            selectedBooking.status
          }
        </span>
      </div>

      {/* CUSTOMER DETAILS */}

      <div
        className={
          styles.detailGrid
        }
      >
        <div>
          <small>
            Customer Name
          </small>

          <strong>
            {
              selectedBooking.name
            }
          </strong>
        </div>

        <div>
          <small>
            Nationality
          </small>

          <strong>
            {
              selectedBooking.nationality
            }
          </strong>
        </div>

        <div>
          <small>
            Email
          </small>

          <strong>
            {
              selectedBooking.email
            }
          </strong>
        </div>

        <div>
          <small>
            Phone
          </small>

          <strong>
            {
              selectedBooking.phone
            }
          </strong>
        </div>

        <div>
          <small>
            Property ID
          </small>

          <strong>
            {
              selectedBooking.propertyId
            }
          </strong>
        </div>

        {selectedBooking.unitReference && (
          <div>
            <small>
              Unit Reference
            </small>

            <strong>
              {
                selectedBooking.unitReference
              }
            </strong>
          </div>
        )}

        {selectedBooking.unitType && (
          <div>
            <small>
              Unit Type
            </small>

            <strong>
              {
                selectedBooking.unitType
              }
            </strong>
          </div>
        )}

        {String(
  selectedBooking.requestType
)
  .trim()
  .toUpperCase() ===
  "ENQUIRY" && (
  <>
    <div
      className={
        styles.enquiryDetailItem
      }
    >
      <small>
        Department
      </small>

      <strong>
        {selectedBooking.inquiryDepartment ||
          "-"}
      </strong>
    </div>

    <div
      className={
        styles.enquiryMessageItem
      }
    >
      <small>
        Enquiry Message
      </small>

      <strong>
        {selectedBooking.enquiryMessage ||
          "-"}
      </strong>
    </div>
  </>
)}

        
      </div>

      {/* PASSPORT */}

      <div
        className={
          styles.passportPanel
        }
      >
        <div>
          <small>
            Passport Document
          </small>

          <strong>
            {selectedBooking.hasPassport
              ? selectedBooking.passportFileName ||
                "Uploaded securely"
              : "-"}
          </strong>
        </div>

        {selectedBooking.hasPassport && (
          <a
            href={`${API_URL}/api/admin/bookings/${selectedBooking.id}/passport`}
            target="_blank"
            rel="noreferrer"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            View Passport
          </a>
        )}
      </div>

      {/* PASSPORT PREVIEW */}

      {selectedBooking.hasPassport &&
        selectedBooking.passportMimeType?.startsWith(
          "image/"
        ) && (
          <img
            src={`${API_URL}/api/admin/bookings/${selectedBooking.id}/passport`}
            alt="Customer passport"
            className={
              styles.passportImagePreview
            }
          />
        )}

      {selectedBooking.hasPassport &&
        selectedBooking.passportMimeType ===
          "application/pdf" && (
          <iframe
            title="Passport document"
            src={`${API_URL}/api/admin/bookings/${selectedBooking.id}/passport`}
            className={
              styles.passportPreview
            }
          />
        )}

      {/* DECLINE REASON */}

      {selectedBooking.status ===
        "Declined" &&
        selectedBooking.declineReason && (
          <div
            className={
              styles.declineReasonBox
            }
          >
            <small>
              Decline Reason
            </small>

            <p>
              {
                selectedBooking.declineReason
              }
            </p>
          </div>
        )}

      {/* PENDING ACTIONS */}

   {selectedBooking.requestType ===
  "BOOKING" &&
  selectedBooking.status ===
    "Pending" && (
        <div
          className={
            styles.modalBookingActions
          }
        >
          <button
            type="button"
            onClick={() =>
  requestBookingConfirmation(
    selectedBooking.id
  )
}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            ✓ Confirm Booking
          </button>

          <button
            type="button"
          onClick={() =>
  requestBookingDecline(
    selectedBooking.id
  )
}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            Decline Booking
          </button>
        </div>
      )}

      
    </div>
  </div>

  
)}

<CommonAlert
  open={
    alertConfig.open
  }
  type={
    alertConfig.type
  }
  title={
    alertConfig.title
  }
  message={
    alertConfig.message
  }
  confirmText={
    alertConfig.confirmText
  }
  showCancel={
    alertConfig.showCancel
  }
  inputRequired={
    alertConfig.inputRequired
  }
  inputLabel={
    alertConfig.inputLabel
  }
  inputPlaceholder={
    alertConfig.inputPlaceholder
  }
  inputValue={
    alertConfig.inputValue
  }
  loading={
    alertConfig.loading
  }
onInputChange={(value) => {
  setDeclineReason(value);

  setAlertConfig(
    (current) => ({
      ...current,
      inputValue: value,
    })
  );
}}
onConfirm={() => {
  if (
    decliningBookingId !==
      null &&
    alertConfig.inputRequired
  ) {
    submitBookingDecline();

    return;
  }

  alertConfig.onConfirm?.();
}}
  onCancel={
    closeAlert
  }
/>
    </div>
  );
}

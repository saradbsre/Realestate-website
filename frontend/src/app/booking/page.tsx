"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileText,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
  Upload,
  WalletCards,
} from "lucide-react";

import styles from "./booking.module.css";


/* =========================================================
   API
========================================================= */

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";


/* =========================================================
   TYPES
========================================================= */

interface NationalityOption {
  id: string;

  nationality: string;

  country: string;
}


interface BookingForm {
  name: string;

  email: string;

  phone: string;

  nationality: string;

  emiratesId: string;

  passport:
    File | null;
}


/* =========================================================
   HELPERS
========================================================= */

const round2 = (
  value: number
) => {
  return (
    Math.round(
      value * 100
    ) / 100
  );
};


/* =========================================================
   BOOKING CONTENT
========================================================= */

function BookingPageContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  /* =======================================================
     SELECTED PROPERTY / UNIT
  ======================================================= */

  const propertyId =
    searchParams.get(
      "propertyId"
    ) || "";

  const propertyName =
    searchParams.get(
      "propertyName"
    ) || "";

  const location =
    searchParams.get(
      "location"
    ) || "";

  const unitReference =
    searchParams.get(
      "unitReference"
    ) || "";

  const unitType =
    searchParams.get(
      "unitType"
    ) || "";

  const annualRent =
    Number(
      searchParams.get(
        "annualRent"
      ) || 0
    );

  const area =
    Number(
      searchParams.get(
        "area"
      ) || 0
    );

  const floorNumber =
    searchParams.get(
      "floorNumber"
    ) || "";

  const installmentsFromUnit =
    Number(
      searchParams.get(
        "payments"
      ) || 1
    );

  const balcony =
    searchParams.get(
      "balcony"
    ) || "No";

  const airConditioning =
    searchParams.get(
      "ac"
    ) || "";

const unitTypeNormalized =
  (
    unitType || ""
  )
    .trim()
    .toUpperCase();

const residentialTypes = [
  "APARTMENT",
  "VILLA",
];

const commercialTypes = [
  "OFFICE",
  "SHOP",
  "SHOW ROOM",
  "SHOWROOM",
  "LABOUR CAMP",
  "WAREHOUSE",
  "STORE",
];

const unitNature:
  "C" | "R" =
  residentialTypes.includes(
    unitTypeNormalized
  )
    ? "R"
    : commercialTypes.includes(
        unitTypeNormalized
      )
    ? "C"
    : "R";


  /* =======================================================
     CURRENT QUOTATION SETTINGS

     Later these can come from ERP / DB.
  ======================================================= */

  const contractDays =
    365;

  const taxPercentage =
    5;

  const serviceCharge =
    0;

  const vatApplicableCompany =
    true;


  /* =======================================================
     FORM
  ======================================================= */

  const [
    booking,
    setBooking,
  ] =
    useState<BookingForm>({
      name: "",

      email: "",

      phone: "",

      nationality: "",

      emiratesId: "",

      passport: null,
    });


  /* =======================================================
     NATIONALITIES
  ======================================================= */

  const [
    nationalities,
    setNationalities,
  ] =
    useState<
      NationalityOption[]
    >([]);

  const [
    loadingNationalities,
    setLoadingNationalities,
  ] =
    useState(true);


  /* =======================================================
     SUBMISSION
  ======================================================= */

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    sent,
    setSent,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  /* =======================================================
     LOAD NATIONALITIES
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadNationalities() {
      try {
        setLoadingNationalities(
          true
        );

        const response =
          await fetch(
            `${API_URL}/api/nationalities`,
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
              "Unable to load nationalities."
          );
        }

        if (
          cancelled
        ) {
          return;
        }

        setNationalities(
          Array.isArray(
            result.data
          )
            ? result.data
            : []
        );
      } catch (
        error
      ) {
        console.error(
          "Nationality load failed:",
          error
        );

        if (
          !cancelled
        ) {
          setNationalities(
            []
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoadingNationalities(
            false
          );
        }
      }
    }

    loadNationalities();

    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =======================================================
     MONEY FORMAT
  ======================================================= */

  const formatMoney = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "en-AE",
      {
        style:
          "currency",

        currency:
          "AED",

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    ).format(
      Number(
        value || 0
      )
    );
  };


  /* =======================================================
     QUOTATION CALCULATION
  ======================================================= */

const breakdown =
  useMemo(() => {
    const installments =
      Number.isFinite(
        installmentsFromUnit
      ) &&
      installmentsFromUnit > 0
        ? installmentsFromUnit
        : 1;

    const rent =
      Math.round(
        (annualRent / 365) *
          contractDays
      );

    const rentPerInstallment =
      installments > 0
        ? round2(
            rent /
              installments
          )
        : 0;

    /* =====================================================
       COMMISSION
    ===================================================== */

    const commission =
      rent < 40000
        ? 2000
        : round2(
            (rent * 5) /
              100
          );


    /* =====================================================
       SECURITY DEPOSIT
    ===================================================== */

    const securityDeposit =
      rent < 60000
        ? 3000
        : round2(
            (rent * 5) /
              100
          );


    /* =====================================================
       VAT ON RENT
       COMMERCIAL ONLY
    ===================================================== */

    const vatOnRent =
      vatApplicableCompany &&
      unitNature === "C"
        ? round2(
            (rent *
              taxPercentage) /
              100
          )
        : 0;


    /* =====================================================
       VAT ON COMMISSION
    ===================================================== */

    const vatOnCommission =
      vatApplicableCompany
        ? round2(
            (commission *
              taxPercentage) /
              100
          )
        : 0;


    /* =====================================================
       SERVICE CHARGE
    ===================================================== */

    const vatOnServiceCharge =
      vatApplicableCompany
        ? round2(
            (serviceCharge *
              taxPercentage) /
              100
          )
        : 0;


    /* =====================================================
       ADMIN CHARGE
    ===================================================== */

    const adminCharge =
      500;

    const vatOnAdminCharge =
      vatApplicableCompany
        ? round2(
            (adminCharge *
              taxPercentage) /
              100
          )
        : 0;


    /* =====================================================
       EJARI

       NO VAT ON EJARI
    ===================================================== */

    const ejari =
      175.65;


    /* =====================================================
       EJARI SERVICE CHARGE

       Total = AED 44.35
       Includes VAT

       Taxable = 42.24
       VAT = 2.11
    ===================================================== */

    const ejariServiceCharge =
      44.35;

    const ejariServiceChargeTaxable =
      round2(
        ejariServiceCharge /
          (
            1 +
            taxPercentage /
              100
          )
      );

    const vatOnEjariServiceCharge =
      round2(
        ejariServiceCharge -
          ejariServiceChargeTaxable
      );


    /* =====================================================
       MANUAL / OPTIONAL
    ===================================================== */

    const accessCard =
      0;

    const contractRegFees =
      0;


    /* =====================================================
       ADDITIONAL CHARGES
    ===================================================== */

    const additionalCharges =
      round2(
        securityDeposit +
          commission +
          vatOnCommission +
          serviceCharge +
          vatOnServiceCharge +
          adminCharge +
          vatOnAdminCharge +
          ejari +
          ejariServiceCharge +
          accessCard +
          contractRegFees +
          vatOnRent
      );


    /* =====================================================
       GRAND TOTAL
    ===================================================== */

    const grandTotal =
      round2(
        rent +
          additionalCharges
      );


    return {
      contractDays,

      installments,

      taxPercentage,

      rent,

      rentPerInstallment,

      securityDeposit,

      commission,

      vatOnCommission,

      serviceCharge,

      vatOnServiceCharge,

      adminCharge,

      vatOnAdminCharge,

      ejari,

      ejariServiceCharge,

      ejariServiceChargeTaxable,

      vatOnEjariServiceCharge,

      accessCard,

      contractRegFees,

      vatOnRent,

      additionalCharges,

      grandTotal,
    };
  }, [
    annualRent,
    installmentsFromUnit,
    unitNature,
  ]);


  /* =======================================================
     SUBMIT BOOKING
  ======================================================= */

  const submitBooking =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError(
        ""
      );


      /* ===============================================
         BASIC VALIDATION
      =============================================== */

      if (
        !booking.name.trim()
      ) {
        setError(
          "Please enter your full name."
        );

        return;
      }


      if (
        !booking.email.trim()
      ) {
        setError(
          "Please enter your email address."
        );

        return;
      }


      if (
        !booking.phone.trim()
      ) {
        setError(
          "Please enter your mobile number."
        );

        return;
      }


      if (
        !booking.nationality
      ) {
        setError(
          "Please select your nationality."
        );

        return;
      }


      /* ===============================================
         EMIRATES ID
      =============================================== */

      const emiratesIdDigits =
        booking.emiratesId.replace(
          /\D/g,
          ""
        );

      if (
        emiratesIdDigits.length !==
        15
      ) {
        setError(
          "Please enter a valid 15-digit Emirates ID."
        );

        return;
      }


      /* ===============================================
         PASSPORT
      =============================================== */

      if (
        !booking.passport
      ) {
        setError(
          "Please attach a passport copy."
        );

        return;
      }


      if (
        booking.passport.size >
        5 *
          1024 *
          1024
      ) {
        setError(
          "Passport copy must be under 5 MB."
        );

        return;
      }


      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          booking.passport.type
        )
      ) {
        setError(
          "Passport copy must be PDF, JPG or PNG."
        );

        return;
      }


      /* ===============================================
         SUBMIT
      =============================================== */

      try {
        setSending(
          true
        );

        const form =
          new FormData();


        form.append(
          "propertyId",
          propertyId
        );

        form.append(
          "propertyName",
          propertyName
        );

        form.append(
          "unitReference",
          unitReference
        );

        form.append(
          "unitType",
          unitType
        );


        form.append(
          "name",
          booking.name.trim()
        );

        form.append(
          "email",
          booking.email.trim()
        );

        form.append(
          "phone",
          booking.phone.trim()
        );

        form.append(
          "nationId",
          booking.nationality
        );

        form.append(
          "emiratesId",
          emiratesIdDigits
        );

        form.append(
          "passport",
          booking.passport
        );


        const response =
          await fetch(
            `${API_URL}/api/bookings`,
            {
              method:
                "POST",

              body:
                form,
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to submit booking."
          );
        }


        setSent(
          true
        );


        window.scrollTo({
          top: 0,

          behavior:
            "smooth",
        });
      } catch (
        error
      ) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to submit booking."
        );
      } finally {
        setSending(
          false
        );
      }
    };


  /* =======================================================
     INVALID BOOKING
  ======================================================= */

  if (
    !propertyId ||
    !propertyName
  ) {
    return (
      <main
        className={
          styles.statePage
        }
      >
        <Building2
          size={
            42
          }
        />

        <h1>
          Booking information unavailable
        </h1>

        <p>
          Please select a property
          and unit before booking.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/properties"
            )
          }
        >
          Browse Properties
        </button>
      </main>
    );
  }


  /* =======================================================
     SUCCESS
  ======================================================= */

  if (
    sent
  ) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.successContainer
          }
        >
          <div
            className={
              styles.successCard
            }
          >
            <div
              className={
                styles.successIcon
              }
            >
              <CircleCheck
                size={
                  38
                }
              />
            </div>

            <span>
              BOOKING REQUEST
            </span>

            <h1>
              Booking request submitted
            </h1>

            <p>
              Thank you. Our team
              will review the unit
              availability and
              contact you.
            </p>

            <div
              className={
                styles.successProperty
              }
            >
              <strong>
                {
                  propertyName
                }
              </strong>

              <span>
                {
                  unitType
                }

                {unitReference
                  ? ` • ${unitReference}`
                  : ""}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/property?id=${encodeURIComponent(
                    propertyId
                  )}`
                )
              }
            >
              Back to Property
            </button>
          </div>
        </div>
      </main>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className={
        styles.page
      }
    >
      {/* =================================================
          TOP BAR
      ================================================= */}

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
      styles.pageContainer
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
          size={
            15
          }
        />

        <span>
          Home
        </span>
      </Link>


      <ChevronRight
        size={
          15
        }
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
          {location
            .split(",")
            .map(
              (
                part
              ) =>
                part.trim()
            )
            .filter(
              Boolean
            )
            .map(
              (
                part,
                index
              ) => (
                <span
                  key={`${part}-${index}`}
                  className={
                    styles.breadcrumbGroup
                  }
                >
                  <ChevronRight
                    size={
                      15
                    }
                    className={
                      styles.breadcrumbArrow
                    }
                  />

                  <Link
                    href={`/properties?search=${encodeURIComponent(
                      part
                    )}`}
                    className={
                      styles.breadcrumbLink
                    }
                  >
                    {
                      part
                    }
                  </Link>
                </span>
              )
            )}
        </>
      )}


      <ChevronRight
        size={
          15
        }
        className={
          styles.breadcrumbArrow
        }
      />


      <Link
        href={`/property?id=${encodeURIComponent(
          propertyId
        )}`}
        className={
          styles.breadcrumbLink
        }
      >
        {
          propertyName
        }
      </Link>


      <ChevronRight
        size={
          15
        }
        className={
          styles.breadcrumbArrow
        }
      />


      <span
        className={
          styles.breadcrumbCurrent
        }
      >
        Booking
      </span>
    </nav>
  </div>
</div>


      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className={
          styles.bookingHeader
        }
      >
        <div
          className={
            styles.pageContainer
          }
        >
          <span
            className={
              styles.eyebrow
            }
          >
            PROPERTY BOOKING
          </span>

          <h1>
            Complete your booking request
          </h1>

          <p>
            Enter your contact
            details and review the
            selected unit and
            quotation breakdown
            before submitting.
          </p>
        </div>
      </section>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className={`${styles.pageContainer} ${styles.bookingLayout}`}
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div
          className={
            styles.mainColumn
          }
        >
          <section
            className={
              styles.bookingCard
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
            

              <div>
                <h2>
                  Your details
                </h2>

                <p>
                  Enter the
                  customer details
                  required for the
                  booking request.
                </p>
              </div>
            </div>


            <form
              className={
                styles.bookingForm
              }
              onSubmit={
                submitBooking
              }
            >
              <div
                className={
                  styles.formGrid
                }
              >
                {/* =======================================
                    NAME
                ======================================= */}

                <div
                  className={`${styles.field} ${styles.fullField}`}
                >
                  <label>
                    Full Name 
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    required
                    type="text"
                    placeholder="Enter your full name"
                    value={
                      booking.name
                    }
                    onChange={(
                      event
                    ) =>
                      setBooking(
                        (
                          current
                        ) => ({
                          ...current,

                          name:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>


                {/* =======================================
                    EMAIL
                ======================================= */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Email Address
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={
                      booking.email
                    }
                    onChange={(
                      event
                    ) =>
                      setBooking(
                        (
                          current
                        ) => ({
                          ...current,

                          email:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>


                {/* =======================================
                    PHONE
                ======================================= */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Mobile Number
                    <span>
                      *
                    </span>
                  </label>

                  <div
                    className={
                      styles.phoneField
                    }
                  >
                    <span>
                      +971
                    </span>

                    <input
                      required
                      type="tel"
                      placeholder="50 123 4567"
                      value={
                        booking.phone
                      }
                      onChange={(
                        event
                      ) =>
                        setBooking(
                          (
                            current
                          ) => ({
                            ...current,

                            phone:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                    />
                  </div>
                </div>


                {/* =======================================
                    NATIONALITY
                ======================================= */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Nationality
                    <span>
                      *
                    </span>
                  </label>

                  <select
                    required
                    value={
                      booking.nationality
                    }
                    disabled={
                      loadingNationalities
                    }
                    onChange={(
                      event
                    ) =>
                      setBooking(
                        (
                          current
                        ) => ({
                          ...current,

                          nationality:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="">
                      {loadingNationalities
                        ? "Loading nationalities..."
                        : "Select nationality"}
                    </option>

                    {nationalities.map(
                      (
                        nationality
                      ) => (
                        <option
                          key={
                            nationality.id
                          }
                          value={
                            nationality.id
                          }
                        >
                          {
                            nationality.nationality
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>


                {/* =======================================
                    EMIRATES ID
                ======================================= */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label>
                    Emirates ID
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={
                      18
                    }
                    placeholder="784-XXXX-XXXXXXX-X"
                    value={
                      booking.emiratesId
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target
                          .value;

                      if (
                        !/^[0-9-]*$/.test(
                          value
                        )
                      ) {
                        return;
                      }

                      setBooking(
                        (
                          current
                        ) => ({
                          ...current,

                          emiratesId:
                            value,
                        })
                      );
                    }}
                  />
                </div>


                {/* =======================================
                    PASSPORT
                ======================================= */}

                <div
                  className={`${styles.field} ${styles.fullField}`}
                >
                  <label>
                    Passport Copy
                    <span>
                      *
                    </span>
                  </label>

                  <label
                    className={
                      styles.fileUpload
                    }
                  >
                    <FileText
                      size={
                        20
                      }
                    />

                    <div>
                      <strong>
                        {booking.passport
                          ? booking
                              .passport
                              .name
                          : "Choose passport file"}
                      </strong>

                      <small>
                        PDF, JPG or
                        PNG. Maximum
                        5 MB.
                      </small>
                    </div>

                    <Upload 
                      size={
                        20
                      }
                    />

                    <input
                      required
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={(
                        event
                      ) =>
                        setBooking(
                          (
                            current
                          ) => ({
                            ...current,

                            passport:
                              event
                                .target
                                .files?.[0] ||
                              null,
                          })
                        )
                      }
                    />
                  </label>
                </div>
              </div>


              {/* =========================================
                  NOTICE
              ========================================= */}

              <div
                className={
                  styles.requestNotice
                }
              >
                <ShieldCheck
                  size={
                    19
                  }
                />

                <div>
                  <strong>
                    Your information
                    is used only for
                    this booking
                    request.
                  </strong>

                  <span>
                    Final tenancy and
                    quotation details
                    will be confirmed
                    by our property
                    team.
                  </span>
                </div>
              </div>


              {/* =========================================
                  ERROR
              ========================================= */}

              {error && (
                <div
                  className={
                    styles.errorMessage
                  }
                >
                  {
                    error
                  }
                </div>
              )}


              {/* =========================================
                  SUBMIT
              ========================================= */}

              <button
                type="submit"
                disabled={
                  sending
                }
                className={
                  styles.submitButton
                }
              >
                {sending
                  ? "Submitting Booking..."
                  : "Submit Booking Request"}
              </button>

            
            </form>
          </section>
        </div>


        {/* =================================================
            RIGHT
        ================================================= */}

        <aside
          className={
            styles.summaryColumn
          }
        >
          {/* ===============================================
              PROPERTY SUMMARY
          =============================================== */}

          <section
            className={
              styles.summaryCard
            }
          >
            <div
              className={
                styles.summaryBadge
              }
            >
              Selected Property
            </div>

            <h2>
              {
                propertyName
              }
            </h2>


            {location && (
              <div
                className={
                  styles.summaryLocation
                }
              >
                <MapPin
                  size={
                    15
                  }
                />

                <span>
                  {
                    location
                  }
                </span>
              </div>
            )}


            <div
              className={
                styles.unitSummary
              }
            >
              <div
                className={
                  styles.unitSummaryIcon
                }
              >
                <Building2
                  size={
                    24
                  }
                />
              </div>

              <div>
                <strong>
                  {unitType ||
                    "Selected Unit"}
                </strong>
{unitReference && (
                  <span>
                    Unit No: {" "}
                    {
                      unitReference
                    }
                  </span>
                )}
                
              </div>
            </div>


            {/* <div
              className={
                styles.unitFeatures
              }
            >
              {area > 0 && (
                <div>
                  <Ruler
                    size={
                      15
                    }
                  />

                  <span>
                    {area.toLocaleString(
                      "en-AE"
                    )}{" "}
                    Sq.Ft.
                  </span>
                </div>
              )}


              {floorNumber && (
                <div>
                  <Building2
                    size={
                      15
                    }
                  />

                  <span>
                    Floor{" "}
                    {
                      floorNumber
                    }
                  </span>
                </div>
              )}


              


              <div>
               

                <span>
                  {balcony ===
                  "Yes"
                    ? "Balcony"
                    : "No Balcony"}
                </span>
              </div>


              {airConditioning && (
                <div>
                  <Check
                    size={
                      15
                    }
                  />

                  <span>
                    Air Conditioning
                  </span>
                </div>
              )}


       
            </div> */}
          </section>


          {/* ===============================================
              PRICE BREAKDOWN
          =============================================== */}

          <section
            className={
              styles.priceCard
            }
          >
            <div
              className={
                styles.priceCardHeader
              }
            >
              <div>
                <span>
                  BOOKING SUMMARY
                </span>

                <h2>
                  Price Breakdown
                </h2>
              </div>
            </div>


            <div
              className={
                styles.priceRows
              }
            >
              {/* =========================================
                  RENT
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Annual Rent
                </span>

                <strong>
                  {breakdown.rent >
                  0
                    ? formatMoney(
                        breakdown.rent
                      )
                    : "Price on Request"}
                </strong>
              </div>
{breakdown.vatOnRent >
                0 && (
                <div
                  className={
                    styles.priceRow
                  }
                >
                  <span>
                    VAT on Rent

                    <small>
                      Commercial {"  "}
                      {
                        breakdown.taxPercentage
                      }
                      %
                    </small>
                  </span>

                  <strong>
                    {formatMoney(
                      breakdown.vatOnRent
                    )}
                  </strong>
                </div>
              )}

              {/* =========================================
                  INSTALLMENT
              ========================================= */}

              {/* <div
                className={
                  styles.priceRow
                }
              > */}
                {/* <span>
                  Rent per Installment

                  <small>
                    {
                      breakdown.installments
                    }{" "}
                    {breakdown.installments ===
                    1
                      ? "Payment"
                      : "Payments"}
                  </small>
                </span> */}

                {/* <strong>
                  {formatMoney(
                    breakdown.rentPerInstallment
                  )}
                </strong> */}
              {/* </div> */}


              {/* =========================================
                  SECURITY DEPOSIT
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Security Deposit
                </span>

                <strong>
                  {formatMoney(
                    breakdown.securityDeposit
                  )}
                </strong>
              </div>


              {/* =========================================
                  COMMISSION
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Commission
                </span>

                <strong>
                  {formatMoney(
                    breakdown.commission
                  )}
                </strong>
              </div>


              {/* =========================================
                  VAT ON COMMISSION
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  VAT on Commission

                  <small>
                    {
                      breakdown.taxPercentage
                    }
                    %
                  </small>
                </span>

                <strong>
                  {formatMoney(
                    breakdown.vatOnCommission
                  )}
                </strong>
              </div>


              {/* =========================================
                  SERVICE CHARGE
              ========================================= */}

              {breakdown.serviceCharge >
                0 && (
                <>
                  <div
                    className={
                      styles.priceRow
                    }
                  >
                    <span>
                      Service Charge
                    </span>

                    <strong>
                      {formatMoney(
                        breakdown.serviceCharge
                      )}
                    </strong>
                  </div>


                  <div
                    className={
                      styles.priceRow
                    }
                  >
                    <span>
                      VAT on Service Charge

                      <small>
                        {
                          breakdown.taxPercentage
                        }
                        %
                      </small>
                    </span>

                    <strong>
                      {formatMoney(
                        breakdown.vatOnServiceCharge
                      )}
                    </strong>
                  </div>
                </>
              )}


              {/* =========================================
                  ADMIN CHARGE
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Admin Fee
                </span>

                <strong>
                  {formatMoney(
                    breakdown.adminCharge
                  )}
                </strong>
              </div>


              {/* =========================================
                  VAT ON ADMIN
              ========================================= */}

              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  VAT on Admin Fee

                  <small>
                    {
                      breakdown.taxPercentage
                    }
                    %
                  </small>
                </span>

                <strong>
                  {formatMoney(
                    breakdown.vatOnAdminCharge
                  )}
                </strong>
              </div>



              {/* =========================================
                  VAT ON EJARI
              ========================================= */}
<div
  className={
    styles.priceRow
  }
>
  <span>
    Ejari
  </span>

  <strong>
    {formatMoney(
      breakdown.ejari
    )}
  </strong>
</div>

<div
  className={
    styles.priceRow
  }
>
  <span>
    Ejari Service Charge

    <small>
      {
        breakdown.taxPercentage
      }
      % VAT Included
    </small>
  </span>

  <strong>
    {formatMoney(
      breakdown.ejariServiceCharge
    )}
  </strong>
</div>
            
              
            </div>


            {/* =============================================
                TOTAL
            ============================================= */}

            <div
              className={
                styles.priceTotal
              }
            >
              <div>
                <span>
                  Estimated Total
                </span>

                <small>
                  Rent + applicable
                  quotation charges
                </small>
              </div>

              <strong>
                {formatMoney(
                  breakdown.grandTotal
                )}
              </strong>
            </div>


            {/* =============================================
                NOTE
            ============================================= */}

            <div
              className={
                styles.sampleNotice
              }
            >
              <strong>
                Booking Calculation
              </strong>

              <p>
                Charges are calculated
                according to the
                current quotation
                rules. Final amounts
                are subject to
                contract and
                management
                confirmation.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}


/* =========================================================
   PAGE EXPORT
========================================================= */

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main
          className={
            styles.statePage
          }
        >
          <Building2
            size={
              42
            }
          />

          <h2>
            Loading booking...
          </h2>
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
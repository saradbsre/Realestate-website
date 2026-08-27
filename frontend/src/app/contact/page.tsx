"use client";

import React, {
  useEffect,
  useState,
} from "react";

import styles from "./contact.module.css";

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   TYPES
========================================================= */

interface NationalityOption {
  id: string;
  nationality: string;
  country: string;
}

interface EnquiryFormData {
  customerName: string;
  email: string;
  phone: string;
  nationality: string;
  inquiryDepartment: string;
  message: string;
}

interface SubmittedEnquiry {
  customerName: string;
  email: string;
  phone: string;
  nationality: string;
  inquiryDepartment: string;
  message: string;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ContactPage() {
  /* =======================================================
     FORM
  ======================================================= */

  const [
    formData,
    setFormData,
  ] =
    useState<EnquiryFormData>({
      customerName: "",
      email: "",
      phone: "",
      nationality: "",
      inquiryDepartment:
        "General Property Inquiry",
      message: "",
    });

  const [
    nationalities,
    setNationalities,
  ] = useState<
    NationalityOption[]
  >([]);

  const [
    loadingNationalities,
    setLoadingNationalities,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    submittedDetails,
    setSubmittedDetails,
  ] =
    useState<SubmittedEnquiry | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
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
      } catch (error) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "Nationality load failed:",
          error
        );

        setNationalities(
          []
        );
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
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    event:
      React.ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      >
  ) => {
    const {
      name,
      value,
    } =
      event.target;

    setFormData(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );

    if (
      errorMessage
    ) {
      setErrorMessage(
        ""
      );
    }
  };

  /* =======================================================
     SUBMIT ENQUIRY
  ======================================================= */

  const handleSubmit =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (
        loading
      ) {
        return;
      }

      setErrorMessage(
        ""
      );

      const customerName =
        formData.customerName.trim();

      const email =
        formData.email.trim();

      const phone =
        formData.phone.trim();

      const nationality =
        formData.nationality.trim();

      const inquiryDepartment =
        formData.inquiryDepartment.trim();

      const message =
        formData.message.trim();

      /* ===================================================
         FRONTEND VALIDATION
      =================================================== */

      if (
        !customerName
      ) {
        setErrorMessage(
          "Please enter your full name."
        );

        return;
      }

      if (
        !email
      ) {
        setErrorMessage(
          "Please enter your email address."
        );

        return;
      }

      if (
        !phone
      ) {
        setErrorMessage(
          "Please enter your phone number."
        );

        return;
      }

      if (
        !nationality
      ) {
        setErrorMessage(
          "Please select your nationality."
        );

        return;
      }

      if (
        !message
      ) {
        setErrorMessage(
          "Please enter your message."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        /* =================================================
           NEW EXPRESS BACKEND
        ================================================= */

        const response =
          await fetch(
            `${API_URL}/api/enquiries`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  customerName,
                  email,
                  phone,
                  nationId:
                    nationality,
                  inquiryDepartment:
                    inquiryDepartment ||
                    null,
                  message,
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
              "Unable to submit enquiry."
          );
        }

        /* =================================================
           KEEP DETAILS FOR SUCCESS SCREEN
        ================================================= */

        setSubmittedDetails({
          customerName,
          email,
          phone,
          nationality:
            nationalities.find(
              (item) =>
                item.id === nationality
            )?.nationality ||
            nationality,
          inquiryDepartment,
          message,
        });

        /* =================================================
           RESET FORM
        ================================================= */

        setFormData({
          customerName:
            "",

          email:
            "",

          phone:
            "",

          nationality:
            "",

          inquiryDepartment:
            "General Property Inquiry",

          message:
            "",
        });
      } catch (error) {
        console.error(
          "Enquiry submit failed:",
          error
        );

        setErrorMessage(
          error instanceof
            Error
            ? error.message
            : "Unable to submit enquiry. Please try again."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     SEND ANOTHER
  ======================================================= */

  const handleSendAnother =
    () => {
      setSubmittedDetails(
        null
      );

      setErrorMessage(
        ""
      );
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        backgroundColor:
          "#f8fafc",

        minHeight:
          "100vh",
      }}
    >
      {/* ===================================================
          HERO
      =================================================== */}

      <header
        className={
          styles.hero
        }
      >
        <h1>
          Get in Touch
        </h1>

        <p>
          Whether you&apos;re
          looking to lease,
          rent, sell, or list
          your property assets,
          we are here to guide
          you.
        </p>
      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main
        className={
          styles.container
        }
      >
        <div
          className={
            styles.grid
          }
        >
          {/* ===============================================
              CONTACT INFORMATION
          =============================================== */}

          <div
            className={
              styles.contactInfo
            }
          >
            <h2>
              Office Contact Info
            </h2>

            <p
              className={
                styles.introText
              }
            >
              Visit our
              headquarters in
              Dubai or call us
              to speak with a
              neighborhood
              specialist
              directly. We look
              forward to
              partnering with
              you on your luxury
              real estate
              journey.
            </p>

            <div
              className={
                styles.infoList
              }
            >
              {/* HEAD OFFICE */}

              <div
                className={
                  styles.infoItem
                }
              >
                <div
                  className={
                    styles.infoIcon
                  }
                >
                  🏢
                </div>

                <div
                  className={
                    styles.infoDetails
                  }
                >
                  <h4>
                    Head Office
                  </h4>

                  <p>
                    Street # 44A -
                    Hor Al Anz -
                    Deira - Dubai,
                    United Arab
                    Emirates
                  </p>

                  <p
                    style={{
                      marginTop:
                        "6px",
                    }}
                  >
                    <a
                      href="https://www.google.com/maps/place/Abdulwahed+Bin+Shabib+Real+Estate+L.L.C"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color:
                          "#0f4c81",

                        fontWeight:
                          600,

                        fontSize:
                          "13px",

                        textDecoration:
                          "underline",
                      }}
                    >
                      View on Google
                      Maps →
                    </a>
                  </p>
                </div>
              </div>

              {/* PHONE */}

              <div
                className={
                  styles.infoItem
                }
              >
                <div
                  className={
                    styles.infoIcon
                  }
                >
                  📞
                </div>

                <div
                  className={
                    styles.infoDetails
                  }
                >
                  <h4>
                    Telephone
                    Support
                  </h4>

                  <p>
                    📞 Tollfree
                    Support:{" "}
                    <a
                      href="tel:80022773"
                      style={{
                        color:
                          "#0f4c81",

                        fontWeight:
                          700,
                      }}
                    >
                      800 22773
                    </a>
                  </p>

                  <p>
                    📞 Direct
                    Landline:{" "}
                    <a
                      href="tel:043298000"
                      style={{
                        color:
                          "#0f4c81",

                        fontWeight:
                          700,
                      }}
                    >
                      04 329 8000
                    </a>
                  </p>
                </div>
              </div>

              {/* EMAIL */}

              <div
                className={
                  styles.infoItem
                }
              >
                <div
                  className={
                    styles.infoIcon
                  }
                >
                  📧
                </div>

                <div
                  className={
                    styles.infoDetails
                  }
                >
                  <h4>
                    Email Support
                  </h4>

                  <p>
                    General
                    Enquiries:{" "}

                    <a
                      href="mailto:info@abdulwahedbinshabibproperty.com"
                      style={{
                        color:
                          "#0f4c81",

                        fontWeight:
                          600,
                      }}
                    >
                      info@abdulwahedbinshabibproperty.com
                    </a>
                  </p>
                </div>
              </div>

              {/* HOURS */}

              <div
                className={
                  styles.infoItem
                }
              >
                <div
                  className={
                    styles.infoIcon
                  }
                >
                  🕒
                </div>

                <div
                  className={
                    styles.infoDetails
                  }
                >
                  <h4>
                    Office Hours
                  </h4>

                  <p>
                    Monday -
                    Saturday:
                    9:30 AM -
                    7:30 PM
                  </p>

                  <p
                    style={{
                      color:
                        "#ef4444",

                      fontWeight:
                        700,
                    }}
                  >
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================
              FORM
          =============================================== */}

          <div
            className={
              styles.formCard
            }
          >
            {!submittedDetails ? (
              <>
                <h3>
                  Send Us a Message
                </h3>

                <p>
                  Fill out the form
                  below and an
                  advisor will
                  contact you
                  shortly.
                </p>

                {errorMessage && (
                  <div
                    style={{
                      marginBottom:
                        "16px",

                      padding:
                        "10px 12px",

                      background:
                        "#fee2e2",

                      border:
                        "1px solid #fecaca",

                      borderRadius:
                        "8px",

                      color:
                        "#b91c1c",

                      fontSize:
                        "13px",
                    }}
                  >
                    {
                      errorMessage
                    }
                  </div>
                )}

                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  {/* FULL NAME */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="customerName"
                      value={
                        formData.customerName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. John Doe"
                      required
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* EMAIL */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Email Address *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="email@address.com"
                      required
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* PHONE */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="+971 50 123 4567"
                      required
                      className={
                        styles.input
                      }
                    />
                  </div>

                  {/* NATIONALITY */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Nationality *
                    </label>

                    <select
                      name="nationality"
                      value={
                        formData.nationality
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        loadingNationalities
                      }
                      className={
                        styles.input
                      }
                    >
                      <option value="">
                        {loadingNationalities
                          ? "Loading nationalities..."
                          : "Select nationality"}
                      </option>

                      {nationalities.map(
                        (
                          item
                        ) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.id
                            }
                          >
                            {
                              item.nationality
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* DEPARTMENT */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Inquiry Department
                    </label>

                    <select
                      name="inquiryDepartment"
                      value={
                        formData.inquiryDepartment
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        styles.input
                      }
                    >
                      <option value="General Property Inquiry">
                        General Property
                        Inquiry
                      </option>

                      <option value="Buying Luxury Asset">
                        Buying Luxury
                        Asset
                      </option>

                      <option value="Renting / Leasing">
                        Renting /
                        Leasing
                      </option>

                      <option value="ERP / API Developer Integration">
                        ERP / API
                        Developer
                        Integration
                      </option>

                      <option value="Listing My Property">
                        Listing My
                        Property
                      </option>
                    </select>
                  </div>

                  {/* MESSAGE */}

                  <div
                    className={
                      styles.formGroup
                    }
                  >
                    <label>
                      Message *
                    </label>

                    <textarea
                      name="message"
                      value={
                        formData.message
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Write your message here..."
                      required
                      className={
                        styles.textarea
                      }
                    />
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    className={
                      styles.submitBtn
                    }
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Enquiry"}
                  </button>
                </form>
              </>
            ) : (
              /* ===========================================
                 SUCCESS
              =========================================== */

              <div
                style={{
                  textAlign:
                    "center",

                  padding:
                    "10px",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "48px",

                    marginBottom:
                      "16px",
                  }}
                >
                  ✅
                </div>

                <h3
                  style={{
                    fontSize:
                      "22px",

                    color:
                      "#1e3a8a",

                    marginBottom:
                      "8px",
                  }}
                >
                  Enquiry Received!
                </h3>

                <p
                  style={{
                    color:
                      "#475569",

                    fontSize:
                      "14px",

                    lineHeight:
                      1.6,

                    marginBottom:
                      "20px",
                  }}
                >
                  Dear{" "}

                  <strong>
                    {
                      submittedDetails.customerName
                    }
                  </strong>
                  , thank you for
                  contacting
                  ABDULWAHED BIN
                  SHABIB REAL ESTATE
                  L.L.C. We have
                  received your
                  enquiry.
                </p>

                {/* DETAILS */}

                <div
                  style={{
                    backgroundColor:
                      "#f1f5f9",

                    borderRadius:
                      "8px",

                    padding:
                      "16px",

                    textAlign:
                      "left",

                    fontSize:
                      "13px",

                    color:
                      "#334155",

                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      marginBottom:
                        "6px",
                    }}
                  >
                    <strong>
                      Department:
                    </strong>{" "}

                    {
                      submittedDetails.inquiryDepartment
                    }
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "6px",
                    }}
                  >
                    <strong>
                      Nationality:
                    </strong>{" "}

                    {
                      submittedDetails.nationality
                    }
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "6px",
                    }}
                  >
                    <strong>
                      Phone:
                    </strong>{" "}

                    {
                      submittedDetails.phone
                    }
                  </div>

                  <div>
                    <strong>
                      Message:
                    </strong>{" "}

                    &quot;
                    {
                      submittedDetails.message
                    }
                    &quot;
                  </div>
                </div>


                {/* WHATSAPP */}

                <a
                  href={`https://wa.me/97143298000?text=${encodeURIComponent(
                    `Hello ABDULWAHED BIN SHABIB REAL ESTATE L.L.C team! I have submitted a website enquiry regarding ${submittedDetails.inquiryDepartment}. My name is ${submittedDetails.customerName}. My phone number is ${submittedDetails.phone}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display:
                      "block",

                    backgroundColor:
                      "#25D366",

                    color:
                      "#ffffff",

                    textDecoration:
                      "none",

                    padding:
                      "14px 20px",

                    borderRadius:
                      "8px",

                    fontWeight:
                      "bold",

                    fontSize:
                      "14px",

                    marginBottom:
                      "16px",
                  }}
                >
                  💬 Chat on
                  WhatsApp
                </a>

                {/* ANOTHER */}

                <button
                  type="button"
                  onClick={
                    handleSendAnother
                  }
                  style={{
                    backgroundColor:
                      "transparent",

                    color:
                      "#64748b",

                    border:
                      "1px solid #cbd5e1",

                    padding:
                      "8px 16px",

                    borderRadius:
                      "6px",

                    fontSize:
                      "13px",

                    cursor:
                      "pointer",
                  }}
                >
                  Send Another
                  Enquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

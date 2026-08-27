"use client";

import React, {
  useEffect,
  useState,
} from "react";

import styles from "./BookingModal.module.css";

interface BookingProperty {
  id: string;
  title: string;

    unitReference?: string | null;
  unitType?: string | null
}
interface NationalityOption {
  id: string;
  nationality: string;
  country: string;
}
interface BookingModalProps {
  property: BookingProperty | null;
  open: boolean;
  onClose: () => void;
}

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passport: File | null;
}



const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

  

export default function BookingModal({
  property,
  open,
  onClose,
}: BookingModalProps) {
  const [booking, setBooking] =
    useState<BookingForm>({
      name: "",
      email: "",
      phone: "",
      nationality: "",
      passport: null,
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
] = useState(true);
  const [sending, setSending] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const [error, setError] =
    useState("");

useEffect(() => {
  if (!open) {
    return;
  }

  async function loadNationalities() {
    try {
      setLoadingNationalities(
        true
      );

      const response =
        await fetch(
          `${API_URL}/api/nationalities`
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load nationalities."
        );
      }

      setNationalities(
        result.data || []
      );
    } catch (error) {
      console.error(
        "Unable to load nationalities:",
        error
      );

      setNationalities([]);
    } finally {
      setLoadingNationalities(
        false
      );
    }
  }

  loadNationalities();
}, [open]);
  if (!open || !property) {
    return null;
  }

  const resetForm = () => {
    setBooking({
      name: "",
      email: "",
      phone: "",
      nationality: "",
      passport: null,
    });

    setSending(false);
    setSent(false);
    setError("");
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const submitBooking = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!API_URL) {
      setError(
        "Backend API URL is not configured."
      );

      return;
    }

    if (!booking.passport) {
      setError(
        "Please attach a passport copy."
      );

      return;
    }

    if (
      booking.passport.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Passport copy must be under 5 MB."
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      const form =
        new FormData();

      /*
       * Building IDs are strings.
       *
       * Example:
       * P:385
       */
      form.append(
        "propertyId",
        property.id
      );

      form.append(
        "propertyName",
        property.title
      );

      if (property.unitReference) {
        console.log(
          "Appending unitReference:",
          property.unitReference
        );
  form.append(
    "unitReference",
    property.unitReference
  );
}

if (property.unitType) {
    console.log("Appending unitType:", property.unitType);
  form.append(
    "unitType",
    property.unitType
  );
}

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
        "passport",
        booking.passport
      );

      const response =
        await fetch(
          `${API_URL}/api/bookings`,
          {
            method: "POST",
            body: form,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to submit booking."
        );
      }

      setSent(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit booking."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={
        styles.modalBackdrop
      }
      role="dialog"
      aria-modal="true"
      aria-label="Book property"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeModal();
        }
      }}
    >
      <div
        className={
          styles.bookingModal
        }
      >
        <button
          type="button"
          className={
            styles.closeModal
          }
          onClick={closeModal}
          aria-label="Close booking form"
        >
          ×
        </button>

        {!sent ? (
          <>
            <div
              className={
                styles.heading
              }
            >
              <span>
                PROPERTY BOOKING
              </span>

              <h2>
                Book this property
              </h2>

              <p>
                Complete your details
                and our  team will
                contact you.
              </p>
            </div>

            <div
              className={
                styles.propertyBox
              }
            >
              <span>
                Selected Property
              </span>

              <strong>
                {property.title}
              </strong>
            </div>

            <form
              onSubmit={
                submitBooking
              }
              className={
                styles.bookingForm
              }
            >
              <div
                className={
                  styles.field
                }
              >
                <label>
                  Full Name
                </label>

                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={booking.name}
                  onChange={(e) =>
                    setBooking(
                      (current) => ({
                        ...current,
                        name:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label>
                  Email Address
                </label>

                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={
                    booking.email
                  }
                  onChange={(e) =>
                    setBooking(
                      (current) => ({
                        ...current,
                        email:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label>
                  Phone Number
                </label>

                <input
                  required
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={
                    booking.phone
                  }
                  onChange={(e) =>
                    setBooking(
                      (current) => ({
                        ...current,
                        phone:
                          e.target
                            .value,
                      })
                    )
                  }
                />
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label>
                  Nationality
                </label>

             <select
  required
  value={
    booking.nationality
  }
  onChange={(e) =>
    setBooking(
      (current) => ({
        ...current,
        nationality:
          e.target.value,
      })
    )
  }
  disabled={
    loadingNationalities
  }
>
  <option value="">
    {loadingNationalities
      ? "Loading nationalities..."
      : "Select nationality"}
  </option>

  {nationalities.map(
    (item) => (
      <option
  key={item.id}
  value={item.id}
>
  {item.nationality}
</option>
    )
  )}
</select>
              </div>

              <div
                className={
                  styles.field
                }
              >
                <label>
                  Passport Copy
                </label>

                <div
                  className={
                    styles.fileBox
                  }
                >
                  <input
                    required
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) =>
                      setBooking(
                        (current) => ({
                          ...current,
                          passport:
                            e.target
                              .files?.[0] ||
                            null,
                        })
                      )
                    }
                  />

                  <span>
                    PDF, JPG or PNG.
                    Maximum 5 MB.
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className={
                    styles.error
                  }
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className={
                  styles.submitButton
                }
              >
                {sending
                  ? "Sending..."
                  : "Send Booking Form"}
              </button>
            </form>
          </>
        ) : (
          <div
            className={
              styles.success
            }
          >
            <div
              className={
                styles.successIcon
              }
            >
              ✓
            </div>

            <h2>
              Booking form sent
            </h2>

            <p>
              Thank you. Our
              team will review your
              request and contact you.
            </p>

            <button
              type="button"
              className={
                styles.submitButton
              }
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

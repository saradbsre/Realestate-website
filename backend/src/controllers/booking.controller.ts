import type {
  Request,
  Response,
} from "express";

import {
  createBooking,
  findBookingProperty,
   findNationalityAutoReject,
} from "../repositories/booking.repository";

import {
  cleanText,
  validateBookingFields,
  validatePassportFile,
} from "../utils/bookingValidation";

import {
  sendBookingEmails,
} from "../utils/bookingEmail";

export async function submitBooking(
  req: Request,
  res: Response
) {
  try {
    /* =====================================================
       READ FIELDS
    ===================================================== */

    const propertyId =
      cleanText(
        req.body.propertyId
      );

    const submittedPropertyName =
      cleanText(
        req.body.propertyName
      );

    const unitReference =
      cleanText(
        req.body.unitReference
      );

    const unitType =
      cleanText(
        req.body.unitType
      );

    const customerName =
      cleanText(
        req.body.name
      );

    const email =
      cleanText(
        req.body.email
      ).toLowerCase();

    const phone =
      cleanText(
        req.body.phone
      );

    const nationId =
      cleanText(
        req.body.nationId
      );

    /* =====================================================
       VALIDATE BASIC FIELDS
    ===================================================== */

    const fieldValidation =
      validateBookingFields({
        propertyId,
        propertyName:
          submittedPropertyName,
        name:
          customerName,
        email,
        phone,
        nationality:
          nationId,
      });

    if (
      !fieldValidation.valid
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            fieldValidation.error,
        });
    }

    if (nationId.length > 7) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid nationality.",
        });
    }

    /* =====================================================
       VALIDATE UNIT DETAILS
    ===================================================== */

    if (
      unitReference &&
      unitReference.length > 100
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid unit reference.",
        });
    }

    if (
      unitType &&
      unitType.length > 150
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid unit type.",
        });
    }

    /* =====================================================
       VALIDATE PASSPORT
    ===================================================== */

    const passport =
      req.file;

    const passportValidation =
      validatePassportFile(
        passport
      );

    if (
      !passportValidation.valid
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            passportValidation.error,
        });
    }

    if (!passport) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Passport copy is required.",
        });
    }

    /* =====================================================
       VERIFY PROPERTY
    ===================================================== */

    const property =
      await findBookingProperty(
        propertyId
      );

    if (!property) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "The selected property could not be found.",
        });
    }

    /*
     * Use ERP property name,
     * not frontend property name.
     */

    const propertyName =
      cleanText(
        property.propertyName
      );

    /* =====================================================
       BOOKING STATUS
    ===================================================== */

 const nationalityConfig =
  await findNationalityAutoReject(
    nationId
  );

const autoRejected =
  nationalityConfig?.isWebBookingAutoReject ===
  true ||
  nationalityConfig?.isWebBookingAutoReject ===
  1;

const declineReason =
  autoRejected
    ? "Booking automatically declined based on nationality configuration."
    : null;

const status =
  autoRejected
    ? "Declined"
    : "Pending";
    /* =====================================================
       INSERT BOOKING
    ===================================================== */

    const booking =
      await createBooking({
        propertyId,
        propertyName,

        /*
         * Directly save values
         * received from frontend.
         */
        unitReference:
          unitReference || null,

        unitType:
          unitType || null,

        customerName,
        email,
        phone,
        nationId,

        passportFile:
          passport.buffer,

        passportFileName:
          passport.originalname,

        passportMimeType:
          passport.mimetype,

        passportFileSize:
          passport.size,

        status,

        isAutoRejected:
          autoRejected,

        declineReason,
      });

    /* =====================================================
       SEND EMAIL
    ===================================================== */

sendBookingEmails({
  bookingId:
    booking.bookingId,

  propertyId,

  propertyName,

  unitReference:
    unitReference || null,

  unitType:
    unitType || null,

  customerName,

  email,

  phone,

  nationality:
    nationalityConfig?.nationality ||
    nationId,

  autoRejected,

  passportBuffer:
    passport.buffer,

  passportFilename:
    passport.originalname,

  passportMimeType:
    passport.mimetype,
}).catch(
      (error) => {
        console.error(
          "Booking email failed:",
          error
        );
      }
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Booking request submitted successfully.",

        bookingId:
          booking.bookingId,

        status:
          booking.status,

        autoRejected,
      });
  } catch (error) {
    console.error(
      "Booking submission failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        error:
          "Unable to submit booking. Please try again.",
      });
  }
}

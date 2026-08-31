import type {
  Request,
  NextFunction,
  Response,
} from "express";

import {
  findAllWebRequests,
  findBookingPassport,
  findWebBookingById,
  updateWebBookingStatus,
} from "../repositories/adminBooking.repository";

/* =========================================================
   GET BOOKINGS
========================================================= */

export async function getWebRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rawType =
      String(
        req.query.requestType ||
          "BOOKING"
      )
        .trim()
        .toUpperCase();

    if (
      rawType !== "BOOKING" &&
      rawType !== "ENQUIRY"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Invalid request type.",
        });
    }

    const data =
      await findAllWebRequests(
        rawType
      );

    return res.json({
      success: true,

      data,
    });
  } catch (error) {
    return next(error);
  }
}

/* =========================================================
   UPDATE BOOKING STATUS
========================================================= */

export async function updateAdminBooking(
  req: Request,
  res: Response
) {
  try {
    const bookingId =
      Number(
        req.params.id
      );

    const status =
      String(
        req.body.status ||
          ""
      ).trim();

    const reason =
      String(
        req.body.reason ||
          ""
      ).trim();

    if (
      !Number.isInteger(
        bookingId
      ) ||
      bookingId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid booking ID.",
        });
    }

    if (
      status !==
        "Confirmed" &&
      status !==
        "Declined"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid booking status.",
        });
    }

    if (
      status ===
        "Declined" &&
      !reason
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Decline reason is required.",
        });
    }

    const booking =
      await findWebBookingById(
        bookingId
      );

    if (!booking) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Booking not found.",
        });
    }

    if (
      booking.status !==
      "Pending"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            `Booking is already ${booking.status}.`,
        });
    }

    await updateWebBookingStatus(
      bookingId,
      status,
      status ===
        "Declined"
        ? reason
        : null
    );

    return res.json({
      success: true,
      message:
        `Booking ${status.toLowerCase()} successfully.`,
    });
  } catch (error: any) {
    console.error(
      "Update booking failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          error?.message ||
          "Unable to update booking.",
      });
  }
}

/* =========================================================
   VIEW PASSPORT
========================================================= */

export async function viewBookingPassport(
  req: Request,
  res: Response
) {
  try {
    const bookingId =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        bookingId
      ) ||
      bookingId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid booking ID.",
        });
    }

    const passport =
      await findBookingPassport(
        bookingId
      );

    if (
      !passport ||
      !passport.PassportFile
    ) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Passport document not found.",
        });
    }

    res.setHeader(
      "Content-Type",
      passport.PassportMimeType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${passport.PassportFileName || "passport"}"`
    );

    return res.send(
      passport.PassportFile
    );
  } catch (error: any) {
    console.error(
      "Passport load failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to load passport.",
      });
  }
}
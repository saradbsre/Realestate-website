import {
  Router,
} from "express";

import {
  bookingUpload,
} from "../config/bookingUpload";

import {
  submitBooking,
} from "../controllers/booking.controller";

const router =
  Router();

router.post(
  "/",
  bookingUpload.single(
    "passport"
  ),
  submitBooking
);

export default router;
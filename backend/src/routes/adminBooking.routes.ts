import {
  Router,
} from "express";

import {
  getAdminBookings,
  updateAdminBooking,
  viewBookingPassport,
} from "../controllers/adminBooking.controller";

const router =
  Router();

router.get(
  "/",
  getAdminBookings
);

router.patch(
  "/:id",
  updateAdminBooking
);

router.get(
  "/:id/passport",
  viewBookingPassport
);

export default router;
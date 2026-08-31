import {
  Router,
} from "express";

import {

  getWebRequests,
  updateAdminBooking,
  viewBookingPassport,
} from "../controllers/adminBooking.controller";

const router =
  Router();

router.get(
  "/",
  getWebRequests
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
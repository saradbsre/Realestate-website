import {
  Router,
} from "express";

import {
  getAdminProperties,
  updateWebDisplay,
} from "../controllers/property.controller";

const router =
  Router();

router.get(
  "/",
  getAdminProperties
);

router.patch(
  "/:id/web-display",
  updateWebDisplay
);

export default router;
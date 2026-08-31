import { Router } from "express";
import { getProperties, getProperty,  getPropertyFilterOptions,  getPropertyUnits } from "../controllers/property.controller";
import {
  getPublicBuildingImages,
  getPublicUnitImages,
} from "../controllers/publicImage.controller";

const router = Router();

router.get("/", getProperties);
router.get(
  "/filter-options",
  getPropertyFilterOptions
);

router.get("/:id/units", getPropertyUnits);
router.get("/:id", getProperty);
router.get(
  "/:buildingId/images",
  getPublicBuildingImages
);

router.get(
  "/:buildingId/units/:unitDesc/images",
  getPublicUnitImages
);
export default router;

import { Router } from "express";
import { getImageManagementBuildings, getProperties, getProperty,  getPropertyFilterOptions,  getPropertyUnits, getPropertyBuildingUnitOptions } from "../controllers/property.controller";
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
router.get(
  "/building-unit-options",
  getPropertyBuildingUnitOptions
);
router.get(
  "/image-buildings",
  getImageManagementBuildings
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

import { Router } from "express";
import { syncProperties } from "../controllers/sync.controller";
import { requireAdmin } from "../middleware/auth";
import { getPublicBuildingImages, getPublicUnitImages } from "../controllers/publicImage.controller";

const router = Router();
router.post("/", requireAdmin, syncProperties);
export default router;
router.get(
  "/:buildingId/images",
  getPublicBuildingImages
);

router.get(
  "/:buildingId/units/:unitDesc/images",
  getPublicUnitImages
);
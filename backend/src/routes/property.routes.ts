import { Router } from "express";
import { getProperties, getProperty,  getPropertyFilterOptions,  getPropertyUnits } from "../controllers/property.controller";

const router = Router();

router.get("/", getProperties);
router.get(
  "/filter-options",
  getPropertyFilterOptions
);

router.get("/:id/units", getPropertyUnits);
router.get("/:id", getProperty);

export default router;

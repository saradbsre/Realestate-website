import { Router } from "express";
import { syncProperties } from "../controllers/sync.controller";
import { requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/", requireAdmin, syncProperties);
export default router;

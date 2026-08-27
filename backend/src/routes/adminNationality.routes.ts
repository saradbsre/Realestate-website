import {
  Router,
} from "express";

import {
  getAutoRejectNationalities,
  getAvailableNationalities,
  addAutoRejectNationality,
  removeAutoRejectNationality,
} from "../controllers/nationality.controller";

const router =
  Router();

/*
 * GET
 * /api/admin/nationality-rules
 *
 * Only iswebBK_autoReject = 1
 */
router.get(
  "/",
  getAutoRejectNationalities
);

/*
 * GET
 * /api/admin/nationality-rules/available
 *
 * Only iswebBK_autoReject = 0
 */
router.get(
  "/available",
  getAvailableNationalities
);

/*
 * POST
 * /api/admin/nationality-rules
 *
 * Set iswebBK_autoReject = 1
 */
router.post(
  "/",
  addAutoRejectNationality
);

/*
 * DELETE
 * /api/admin/nationality-rules/:id
 *
 * Set iswebBK_autoReject = 0
 */
router.delete(
  "/:id",
  removeAutoRejectNationality
);

export default router;
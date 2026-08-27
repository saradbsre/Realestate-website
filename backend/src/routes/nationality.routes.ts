import {
  Router,
} from "express";

import {
  getNationalities,
} from "../controllers/nationality.controller";

const router =
  Router();

router.get(
  "/",
  getNationalities
);

export default router;
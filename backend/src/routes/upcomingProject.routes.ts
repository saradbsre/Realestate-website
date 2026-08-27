import {
  Router,
} from "express";

import {
  addUpcomingProject,
  getAreas,
  getPlaces,
  getUpcomingProjects,
} from "../controllers/upcomingProject.controller";
import {
  editUpcomingProject,
  removeUpcomingProject,
} from "../controllers/upcomingProject.controller";

const router =
  Router();

router.get(
  "/",
  getUpcomingProjects
);

router.get(
  "/places",
  getPlaces
);

router.get(
  "/areas",
  getAreas
);

router.post(
  "/",
  addUpcomingProject
);

router.put(
  "/:id",
  editUpcomingProject
);

router.delete(
  "/:id",
  removeUpcomingProject
);

export default router;
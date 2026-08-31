import {
  Router,
} from "express";

import {
  deleteBuildImage,
  getBuildImages,
  makeBuildImagePrimary,
  saveBuildImageOrder,
  uploadBuildImages,
} from "../controllers/buildImage.controller";

import {
  ImageUpload,
} from "../config/ImageUpload";

const router =
  Router();


router.get(
  "/:buildingId",
  getBuildImages
);


router.post(
  "/:buildingId/upload",

  ImageUpload.array(
    "images",
    20
  ),

  uploadBuildImages
);


/* SAVE DRAG/DROP ORDER */

router.patch(
  "/:buildingId/order",
  saveBuildImageOrder
);


/* MANUAL PRIMARY */

router.patch(
  "/:buildingId/:imageId/primary",
  makeBuildImagePrimary
);


/* DELETE */

router.delete(
  "/:buildingId/:imageId",
  deleteBuildImage
);


export default router;
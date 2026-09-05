import {
  Router,
} from "express";

import {
  copyImagesFromUnit,
  deleteUnitImage,
  getUnitImages,
  getUnitsWithImages,
  makeUnitImagePrimary,
  saveUnitImageOrder,
  uploadUnitImages,
} from "../controllers/unitImage.controller";

import {
  ImageUpload,
} from "../config/ImageUpload";

const router =
  Router();


/* =========================================================
   AVAILABLE UNITS
========================================================= */

router.get(
  "/available-units",
  getUnitsWithImages
);


/* =========================================================
   GET CURRENT UNIT IMAGES
========================================================= */

router.get(
  "/:buildingId/:unitDesc",
  getUnitImages
);


/* =========================================================
   UPLOAD MULTIPLE UNIT IMAGES
========================================================= */

router.post(
  "/:buildingId/:unitDesc/upload",

  ImageUpload.array(
    "images",
    20
  ),

  uploadUnitImages
);


/* =========================================================
   REUSE
========================================================= */

router.post(
  "/:buildingId/:unitDesc/reuse",
  copyImagesFromUnit
);


/* =========================================================
   SAVE ORDER
========================================================= */

router.patch(
  "/:buildingId/:unitDesc/order",
  saveUnitImageOrder
);


/* =========================================================
   SET PRIMARY
========================================================= */

router.patch(
  "/:buildingId/:unitDesc/:imageId/primary",
  makeUnitImagePrimary
);


/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:buildingId/:unitDesc/:imageId",
  deleteUnitImage
);


export default router;
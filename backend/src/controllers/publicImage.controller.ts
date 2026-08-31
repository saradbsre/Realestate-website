import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  findPublicBuildingImages,
  findPublicUnitImages,
} from "../repositories/publicImage.repository";


const R2_PUBLIC_URL =
  (
    process.env.R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");


/* =========================================================
   BUILDING IMAGES
========================================================= */

export async function getPublicBuildingImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      decodeURIComponent(
        String(
          req.params.buildingId ||
            ""
        )
      ).trim();

    if (!buildingId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID is required.",
        });
    }
const TEST_BUILDING_ID =
  "P:363";
    const rows =
      await findPublicBuildingImages(
        // buildingId
        TEST_BUILDING_ID
      );

    const data =
      rows.map(
        (row) => ({
          ...row,

          imageUrl:
            R2_PUBLIC_URL
              ? `${R2_PUBLIC_URL}/${row.imagePath}`
              : null,
        })
      );

    return res.json({
      success: true,

      total:
        data.length,

      data,
    });
  } catch (error) {
    console.error(
      "PUBLIC BUILDING IMAGE ERROR:",
      error
    );

    return next(error);
  }
}


/* =========================================================
   UNIT IMAGES
========================================================= */

export async function getPublicUnitImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      decodeURIComponent(
        String(
          req.params.buildingId ||
            ""
        )
      ).trim();

    const unitDesc =
      decodeURIComponent(
        String(
          req.params.unitDesc ||
            ""
        )
      ).trim();

    if (
      !buildingId ||
      !unitDesc
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Building ID and unit are required.",
        });
    }

    const rows =
      await findPublicUnitImages(
        buildingId,
        unitDesc
      );

    const data =
      rows.map(
        (row) => ({
          ...row,

          imageUrl:
            R2_PUBLIC_URL
              ? `${R2_PUBLIC_URL}/${row.imagePath}`
              : null,
        })
      );

    return res.json({
      success: true,

      total:
        data.length,

      data,
    });
  } catch (error) {
    console.error(
      "PUBLIC UNIT IMAGE ERROR:",
      error
    );

    return next(error);
  }
}
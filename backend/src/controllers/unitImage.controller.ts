import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import {
  randomUUID,
} from "crypto";

import {
  r2Client,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} from "../config/cloudFlareR2";

import {
  deleteUnitImageRecord,
  findUnitImages,
  findUnitsWithImages,
  getNextUnitImageDisplayOrder,
  reuseUnitImages,
  saveUnitImage,
  setUnitImagePrimary,
  unitExists,
  updateUnitImageOrder,
} from "../repositories/unitImage.repository";


function cleanPathPart(
  value: string
) {
  return value
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
}


function getExtension(
  mimeType: string
) {
  if (
    mimeType ===
    "image/png"
  ) {
    return "png";
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
}


function makePublicUrl(
  imagePath: string
) {
  if (!R2_PUBLIC_URL) {
    return null;
  }

  return `${R2_PUBLIC_URL.replace(
    /\/$/,
    ""
  )}/${imagePath}`;
}


/* =========================================================
   GET UNIT IMAGES
========================================================= */

export async function getUnitImages(
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
            "Building ID and Unit are required.",
        });
    }

    const rows =
      await findUnitImages(
        buildingId,
        unitDesc
      );

    const data =
      rows.map(
        (row) => ({
          ...row,

          imageUrl:
            makePublicUrl(
              row.imagePath
            ),
        })
      );

    return res.json({
      success: true,

      data,
    });
  } catch (error) {
    return next(error);
  }
}


/* =========================================================
   AVAILABLE UNITS
========================================================= */

export async function getUnitsWithImages(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      await findUnitsWithImages();

    return res.json({
      success: true,

      data,
    });
  } catch (error) {
    return next(error);
  }
}


/* =========================================================
   UPLOAD MULTIPLE UNIT IMAGES
========================================================= */

export async function uploadUnitImages(
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

    const files =
      req.files as
        Express.Multer.File[];

    if (
      !buildingId ||
      !unitDesc
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID and Unit are required.",
        });
    }

    if (
      !files ||
      files.length === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Please select at least one image.",
        });
    }

    const exists =
      await unitExists(
        buildingId,
        unitDesc
      );

    if (!exists) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Unit not found.",
        });
    }

    const {
      nextOrder,
      currentCount,
    } =
      await getNextUnitImageDisplayOrder(
        buildingId,
        unitDesc
      );

    const safeBuilding =
      cleanPathPart(
        buildingId
      );

    const safeUnit =
      cleanPathPart(
        unitDesc
      );

    const uploadedImages:
      any[] = [];

    const failedImages:
      {
        fileName: string;
        error: string;
      }[] = [];

    for (
      let index = 0;
      index <
      files.length;
      index++
    ) {
      const file =
        files[index];

      let imagePath:
        string | null =
        null;

      try {
        if (
          ![
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(
            file.mimetype
          )
        ) {
          throw new Error(
            "Unsupported image type."
          );
        }

        if (
          file.size >
          5 *
            1024 *
            1024
        ) {
          throw new Error(
            "Image exceeds 5 MB."
          );
        }

        const extension =
          getExtension(
            file.mimetype
          );

        imagePath =
          `units/${safeBuilding}/${safeUnit}/${randomUUID()}.${extension}`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket:
              R2_BUCKET_NAME,

            Key:
              imagePath,

            Body:
              file.buffer,

            ContentType:
              file.mimetype,

            CacheControl:
              "public, max-age=31536000",
          })
        );

        try {
          const imageId =
            await saveUnitImage({
              buildingId,

              unitDesc,

              imagePath,

              fileName:
                file.originalname,

              fileSize:
                file.size,

              displayOrder:
                nextOrder +
                uploadedImages.length,

              isPrimary:
                currentCount ===
                  0 &&
                uploadedImages.length ===
                  0,

              createdBy:
                "WEBSITE",
            });

          uploadedImages.push({
            imageId,

            buildingId,

            unitDesc,

            imagePath,

            imageUrl:
              makePublicUrl(
                imagePath
              ),

            fileName:
              file.originalname,

            fileSize:
              file.size,

            displayOrder:
              nextOrder +
              uploadedImages.length,

            isPrimary:
              currentCount ===
                0 &&
              uploadedImages.length ===
                0,
          });
        } catch (
          sqlError
        ) {
          if (
            imagePath
          ) {
            try {
              await r2Client.send(
                new DeleteObjectCommand({
                  Bucket:
                    R2_BUCKET_NAME,

                  Key:
                    imagePath,
                })
              );
            } catch (
              cleanupError
            ) {
              console.error(
                "R2 cleanup failed:",
                cleanupError
              );
            }
          }

          throw sqlError;
        }
      } catch (
        error
      ) {
        failedImages.push({
          fileName:
            file.originalname,

          error:
            error instanceof
            Error
              ? error.message
              : "Upload failed.",
        });
      }
    }

    if (
      uploadedImages.length ===
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "No images could be uploaded.",

          failed:
            failedImages,
        });
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          `${uploadedImages.length} image(s) uploaded successfully.`,

        data:
          uploadedImages,

        failed:
          failedImages,
      });
  } catch (
    error
  ) {
    return next(
      error
    );
  }
}

/* =========================================================
   REUSE IMAGES
========================================================= */

export async function copyImagesFromUnit(
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

    const sourceBuildingId =
      String(
        req.body
          .sourceBuildingId ||
          ""
      ).trim();

    const sourceUnitDesc =
      String(
        req.body
          .sourceUnitDesc ||
          ""
      ).trim();

    if (
      !buildingId ||
      !unitDesc ||
      !sourceBuildingId ||
      !sourceUnitDesc
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Source and target unit details are required.",
        });
    }

    const count =
      await reuseUnitImages(
        buildingId,
        unitDesc,
        sourceBuildingId,
        sourceUnitDesc
      );

    if (
      count === 0
    ) {
      return res
        .status(404)
        .json({
          success: false,

          error:
            "Source unit has no images.",
        });
    }

    return res.json({
      success: true,

      message:
        `${count} image(s) reused successfully.`,
    });
  } catch (error) {
    return next(error);
  }
}


/* =========================================================
   SAVE ORDER
========================================================= */

export async function saveUnitImageOrder(
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

    const imageIds =
      req.body.imageIds;

    if (
      !Array.isArray(
        imageIds
      ) ||
      imageIds.length ===
        0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Image order is required.",
        });
    }

    const ids =
      imageIds.map(
        (value) =>
          Number(value)
      );

    if (
      ids.some(
        (value) =>
          !Number.isInteger(
            value
          ) ||
          value <= 0
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Invalid image order.",
        });
    }

    await updateUnitImageOrder(
      buildingId,
      unitDesc,
      ids
    );

    return res.json({
      success: true,

      message:
        "Unit image order saved successfully.",
    });
  } catch (error) {
    return next(error);
  }
}


/* =========================================================
   SET PRIMARY
========================================================= */

export async function makeUnitImagePrimary(
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

    const imageId =
      Number(
        req.params.imageId
      );

    if (
      !Number.isInteger(
        imageId
      ) ||
      imageId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Invalid image ID.",
        });
    }

    await setUnitImagePrimary(
      buildingId,
      unitDesc,
      imageId
    );

    return res.json({
      success: true,

      message:
        "Primary unit image updated successfully.",
    });
  } catch (error) {
    return next(error);
  }
}


/* =========================================================
   DELETE UNIT IMAGE
========================================================= */

export async function deleteUnitImage(
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

    const imageId =
      Number(
        req.params.imageId
      );

    if (
      !Number.isInteger(
        imageId
      ) ||
      imageId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          error:
            "Invalid image ID.",
        });
    }

    const deleted =
      await deleteUnitImageRecord(
        buildingId,
        unitDesc,
        imageId
      );

    /*
     * Only remove physical R2 object
     * when nobody else references it.
     */
    if (
      deleted.imagePath &&
      deleted.remainingReferences ===
        0
    ) {
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket:
              R2_BUCKET_NAME,

            Key:
              deleted.imagePath,
          })
        );
      } catch (error) {
        console.error(
          "R2 delete failed:",
          error
        );
      }
    }

    return res.json({
      success: true,

      message:
        "Unit image deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}
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
  findBuildImages,
  findBuildImageById,
  getNextBuildImageDisplayOrder,
  saveBuildImage,
  updateBuildImageOrder,
  setBuildImagePrimary,
  deleteBuildImageRecord,  
} from "../repositories/buildImage.repository";


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

  return `${R2_PUBLIC_URL}/${imagePath}`;
}


/* =========================================================
   MULTIPLE BUILDING IMAGE UPLOAD
========================================================= */

export async function uploadBuildImages(
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

    const files =
      req.files as
        | Express.Multer.File[]
        | undefined;

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

    const {
      nextOrder,
      currentCount,
    } =
      await getNextBuildImageDisplayOrder(
        buildingId
      );

    const uploadedImages: {
      imageId: number;
      imagePath: string;
      imageUrl: string | null;
      fileName: string;
      fileSize: number;
      displayOrder: number;
      isPrimary: boolean;
    }[] = [];

    const safeBuilding =
      cleanPathPart(
        buildingId
      );

    for (
      let index = 0;
      index <
      files.length;
      index++
    ) {
      const file =
        files[index];

      const extension =
        getExtension(
          file.mimetype
        );

      const cloudFileName =
        `${randomUUID()}.${extension}`;

      const imagePath =
        `buildings/${safeBuilding}/${cloudFileName}`;

      const displayOrder =
        nextOrder + index;

      const isPrimary =
        currentCount === 0 &&
        index === 0;

      /*
       * Upload physical file
       * to Cloudflare R2
       */
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

      /*
       * Store R2 path in SQL
       */
      const imageId =
        await saveBuildImage({
          buildingId,

          imagePath,

          fileName:
            file.originalname,

          fileSize:
            file.size,

          displayOrder,

          isPrimary,

          createdBy:
            "WEBSITE",
        });

      uploadedImages.push({
        imageId,

        imagePath,

        imageUrl:
          makePublicUrl(
            imagePath
          ),

        fileName:
          file.originalname,

        fileSize:
          file.size,

        displayOrder,

        isPrimary,
      });
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          `${uploadedImages.length} building image(s) uploaded successfully.`,

        data:
          uploadedImages,
      });
  } catch (error) {
    return next(error);
  }
}

export async function getBuildImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      decodeURIComponent(
        String(
          req.params.buildingId || ""
        )
      ).trim();

    if (!buildingId) {
      return res.status(400).json({
        success: false,
        error:
          "Building ID is required.",
      });
    }

    const rows =
      await findBuildImages(
        buildingId
      );

    const data = rows.map(
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

export async function saveBuildImageOrder(
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

    const imageIds =
      req.body.imageIds;

    if (!buildingId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID is required.",
        });
    }

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
        (id) =>
          Number(id)
      );

    if (
      ids.some(
        (id) =>
          !Number.isInteger(
            id
          ) ||
          id <= 0
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid image ID.",
        });
    }

    await updateBuildImageOrder(
      buildingId,
      ids
    );

    return res.json({
      success: true,

      message:
        "Image order saved successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function makeBuildImagePrimary(
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

    const imageId =
      Number(
        req.params.imageId
      );

    if (
      !buildingId ||
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
            "Invalid image.",
        });
    }

    await setBuildImagePrimary(
      buildingId,
      imageId
    );

    return res.json({
      success: true,

      message:
        "Primary image updated successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteBuildImage(
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

    const imageId =
      Number(
        req.params.imageId
      );

    if (
      !buildingId ||
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
            "Invalid image.",
        });
    }

    const deleted =
      await deleteBuildImageRecord(
        buildingId,
        imageId
      );

    /*
     * Remove physical R2 image after
     * database record has been disabled.
     */
    if (
      deleted.imagePath
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
      } catch (r2Error) {
        console.error(
          "Unable to remove R2 object:",
          r2Error
        );
      }
    }

    return res.json({
      success: true,

      message:
        "Image deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}
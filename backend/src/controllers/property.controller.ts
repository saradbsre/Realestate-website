import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  countProperties,
  findAllAdminProperties,
  findAllProperties,
  findFeaturedProperties,
  findImageManagementBuildings,
  findPropertyByBuildingId,
  findVacantUnitsByBuildingId,
  getPropertyBuildingUnitOptionsRepo,
  getPropertyFilterOptionsRepo,
  updatePropertyWebDisplay,
type PropertySearchParams,
} from "../repositories/property.repository";

export async function getProperties(
  req: Request,
  res: Response
) {
  try {
    const page =
      Math.max(
        1,
        Number(
          req.query.page
        ) || 1
      );

    const pageSize =
      Math.min(
        100,
        Math.max(
          1,
          Number(
            req.query.pageSize
          ) || 20
        )
      );

    /* =====================================================
       VIEW MODE
    ===================================================== */

    const view:
      "building" |
      "unitType" =
      req.query.view ===
      "building"
        ? "building"
        : "unitType";


    /* =====================================================
       FILTERS
    ===================================================== */

    const filters:
      PropertySearchParams =
      {
        search:
          typeof req.query.search ===
          "string"
            ? req.query.search
            : undefined,

            

        unitTypeId:
          req.query.unitTypeId
            ? Number(
                req.query.unitTypeId
              )
            : undefined,

        beds:
          typeof req.query.beds ===
          "string"
            ? req.query.beds
            : undefined,

        minPrice:
          req.query.minPrice
            ? Number(
                req.query.minPrice
              )
            : undefined,

        maxPrice:
          req.query.maxPrice
            ? Number(
                req.query.maxPrice
              )
            : undefined,

        minArea:
          req.query.minArea
            ? Number(
                req.query.minArea
              )
            : undefined,

        maxArea:
          req.query.maxArea
            ? Number(
                req.query.maxArea
              )
            : undefined,

            buildingId:
  typeof req.query.buildingId ===
  "string"
    ? req.query.buildingId
    : undefined,

unitDesc:
  typeof req.query.unitDesc ===
  "string"
    ? req.query.unitDesc
    : undefined,

        page,

        pageSize,

        view,
      };


    /* =====================================================
       FETCH DATA
    ===================================================== */

    const rows =
      view ===
      "building"
        ? await findFeaturedProperties(
            filters
          )
        : await findAllProperties(
            filters
          );


    /* =====================================================
       COUNT
    ===================================================== */

    const total =
      view ===
      "building"
        ? rows.length
        : await countProperties(
            filters
          );


    /* =====================================================
       R2 PUBLIC URL
    ===================================================== */

    const r2PublicUrl =
      (
        process.env
          .R2_PUBLIC_URL ||
        ""
      ).replace(
        /\/$/,
        ""
      );


    /* =====================================================
       NORMALIZE IMAGES
    ===================================================== */

    const data =
      rows.map(
        (
          row: any
        ) => {
          let images:
            any[] = [];


          if (
            typeof row.imagePaths ===
              "string" &&
            row.imagePaths
          ) {
            try {
              images =
                JSON.parse(
                  row.imagePaths
                );
            } catch {
              images =
                [];
            }
          }


          const imagePaths =
            images.map(
              (
                image
              ) => ({
                ...image,

                imageUrl:
                  image.imagePath &&
                  r2PublicUrl
                    ? `${r2PublicUrl}/${image.imagePath}`
                    : null,
              })
            );


          let primaryImagePath =
            row.primaryImagePath ||
            null;


          /*
           * Unit type query may not
           * return primaryImagePath.
           * Use first gallery image.
           */
          if (
            !primaryImagePath &&
            imagePaths.length >
              0
          ) {
            primaryImagePath =
              imagePaths[0]
                .imagePath ||
              null;
          }


          const primaryImageUrl =
            primaryImagePath &&
            r2PublicUrl
              ? `${r2PublicUrl}/${primaryImagePath}`
              : null;


    return {
  ...row,

  imagePaths,

  galleryImages:
    imagePaths,

  primaryImagePath,

  primaryImageUrl,
};
        }
      );


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      success: true,

      data,

      pagination: {
        page,

        pageSize,

        totalRecords:
          total,

        totalPages:
          view ===
          "building"
            ? Math.ceil(
                total /
                  pageSize
              ) || 1
            : Math.ceil(
                total /
                  pageSize
              ),
      },

      view,
    });
  } catch (
    error
  ) {
    console.error(
      "GET PROPERTIES ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        error:
          "Unable to load properties.",
      });
  }
}
export async function getProperty(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      req.params.id?.trim();

    if (
      !buildingId ||
      buildingId.length > 7
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid building ID",
        });
    }

    const property =
      await findPropertyByBuildingId(
        buildingId
      );

    if (!property) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Property not found",
        });
    }

    return res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    return next(error);
  }
}
export async function getPropertyUnits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      req.params.id?.trim();

    if (
      !buildingId ||
      buildingId.length > 7
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid building ID",
        });
    }

    const units =
      await findVacantUnitsByBuildingId(
        buildingId
      );

    return res.json({
      success: true,

      total:
        units.length,

      data:
        units,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPropertyFilterOptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rows =
      await getPropertyFilterOptionsRepo();

    const grouped = rows.reduce(
      (
        acc: Record<
          string,
          {
            categoryId: string;
            categoryName: string;
            types: {
              id: number;
              name: string;
            }[];
          }
        >,
        row: any
      ) => {
        if (!acc[row.categoryId]) {
          acc[row.categoryId] = {
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            types: [],
          };
        }

        if (row.unitTypeId) {
          acc[row.categoryId].types.push({
            id: row.unitTypeId,
            name: row.unitTypeName,
          });
        }

        return acc;
      },
      {}
    );

    return res.json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateWebDisplay(
  req: Request,
  res: Response
) {
  try {
    const buildId =
      String(
        req.params.id ||
        ""
      ).trim();

    if (!buildId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID is required.",
        });
    }

    const rawValue =
      req.body.webDisplayOrder;

    let webDisplayOrder:
      number | null = null;

    /* NULL = normal listing */

    if (
      rawValue !== null &&
      rawValue !== undefined &&
      rawValue !== ""
    ) {
      webDisplayOrder =
        Number(rawValue);

      if (
        !Number.isInteger(
          webDisplayOrder
        ) ||
        webDisplayOrder < 0 ||
        webDisplayOrder > 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Website display value must be 0 to 6 or null.",
          });
      }
    }

    const affected =
      await updatePropertyWebDisplay(
        buildId,
        webDisplayOrder
      );

    if (affected === 0) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Building not found.",
        });
    }

    return res.json({
      success: true,

      message:
        "Website display updated successfully.",
    });
  } catch (error: any) {
    console.error(
      "Update property web display failed:",
      error
    );

    /*
     * Unique priority position
     * already assigned.
     */

    if (
      error?.number === 2601 ||
      error?.number === 2627
    ) {
      return res
        .status(409)
        .json({
          success: false,
          error:
            "This Top Priority position is already assigned to another building.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to update website display.",
      });
  }
}

export async function getAdminProperties(
  _req: Request,
  res: Response
) {
  try {
    const properties =
      await findAllAdminProperties();

    return res.json({
      success: true,
      data:
        properties.map(
          (
            property
          ) => ({
            ...property,

            location: [
              property.areaName,
              property.placeName,
            ]
              .filter(Boolean)
              .join(", "),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Admin property load failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to load properties.",
      });
  }
}


export async function getImageManagementBuildings(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data =
      await findImageManagementBuildings();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPropertyBuildingUnitOptions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const buildingId =
      typeof req.query.buildingId ===
      "string"
        ? req.query.buildingId.trim()
        : undefined;

    const data =
      await getPropertyBuildingUnitOptionsRepo(
        buildingId
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}
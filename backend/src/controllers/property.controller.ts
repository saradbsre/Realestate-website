import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  countProperties,
  findAllAdminProperties,
  findAllProperties,
  findImageManagementBuildings,
  findPropertyByBuildingId,
  findVacantUnitsByBuildingId,
  getPropertyFilterOptionsRepo,
  updatePropertyWebDisplay,
type PropertySearchParams,
} from "../repositories/property.repository";

export async function getProperties(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page =
      req.query.page !== undefined
        ? Number(req.query.page)
        : 1;

    const pageSize =
      req.query.pageSize !== undefined
        ? Number(req.query.pageSize)
        : 20;

    /* ========================================
       UNIT TYPE
    ======================================== */

    const unitTypeId =
      req.query.unitTypeId !== undefined &&
      req.query.unitTypeId !== ""
        ? Number(req.query.unitTypeId)
        : undefined;

    if (
      unitTypeId !== undefined &&
      (
        !Number.isInteger(unitTypeId) ||
        unitTypeId <= 0
      )
    ) {
      return res.status(400).json({
        error: "Invalid property type",
      });
    }

    /* ========================================
       PRICE
    ======================================== */

    const minPrice =
      req.query.minPrice !== undefined &&
      req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice =
      req.query.maxPrice !== undefined &&
      req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : undefined;

    if (
      minPrice !== undefined &&
      Number.isNaN(minPrice)
    ) {
      return res.status(400).json({
        error: "Invalid minimum price",
      });
    }

    if (
      maxPrice !== undefined &&
      Number.isNaN(maxPrice)
    ) {
      return res.status(400).json({
        error: "Invalid maximum price",
      });
    }

    const filters: PropertySearchParams = {
      search:
        typeof req.query.search === "string"
          ? req.query.search.trim() ||
            undefined
          : undefined,

      unitTypeId,

      beds:
        typeof req.query.beds === "string"
          ? req.query.beds.trim() ||
            undefined
          : undefined,

      minPrice,

      maxPrice,

      page,

      pageSize,
    };

    const [rows, total] =
  await Promise.all([
    findAllProperties(filters),
    countProperties(filters),
  ]);

const r2PublicUrl =
  (
    process.env.R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");

const data =
  rows.map((property) => ({
    ...property,

    primaryImageUrl:
      property.primaryImagePath &&
      r2PublicUrl
        ? `${r2PublicUrl}/${property.primaryImagePath}`
        : null,
  }));

const actualPageSize =
  Math.min(
    pageSize,
    100
  );
console.log(
  "R2_PUBLIC_URL:",
  r2PublicUrl
);

console.log(
  "FIRST PROPERTY BEFORE MAP:",
  rows[0]
);

console.log(
  "FIRST PROPERTY AFTER MAP:",
  data[0]
);
return res.json({
  success: true,

  data,

  pagination: {
    page,

    pageSize:
      actualPageSize,

    totalRecords:
      total,

    totalPages:
      Math.ceil(
        total /
          actualPageSize
      ),
  },
});
  } catch (error) {
    console.error(
      "Get properties failed:",
      error
    );

    return next(error);
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
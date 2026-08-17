import {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  countProperties,
  findAllProperties,
  findPropertyByBuildingId,
  findVacantUnitsByBuildingId,
  getPropertyFilterOptionsRepo,
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


    /*
    ========================================
    UNIT TYPE
    ========================================
    */

    const unitTypeId =
      req.query.unitTypeId !== undefined &&
      req.query.unitTypeId !== ""
        ? Number(
            req.query.unitTypeId
          )
        : undefined;

    if (
      unitTypeId !== undefined &&
      (
        !Number.isInteger(
          unitTypeId
        ) ||
        unitTypeId <= 0
      )
    ) {
      return res.status(400).json({
        error:
          "Invalid property type",
      });
    }


    /*
    ========================================
    PRICE
    ========================================
    */

    const minPrice =
      req.query.minPrice !== undefined &&
      req.query.minPrice !== ""
        ? Number(
            req.query.minPrice
          )
        : undefined;

    const maxPrice =
      req.query.maxPrice !== undefined &&
      req.query.maxPrice !== ""
        ? Number(
            req.query.maxPrice
          )
        : undefined;


    if (
      minPrice !== undefined &&
      Number.isNaN(minPrice)
    ) {
      return res.status(400).json({
        error:
          "Invalid minimum price",
      });
    }


    if (
      maxPrice !== undefined &&
      Number.isNaN(maxPrice)
    ) {
      return res.status(400).json({
        error:
          "Invalid maximum price",
      });
    }


    const filters: PropertySearchParams = {

      search:
        typeof req.query.search ===
        "string"
          ? req.query.search.trim() ||
            undefined
          : undefined,


      unitTypeId,


      beds:
        typeof req.query.beds ===
        "string"
          ? req.query.beds.trim() ||
            undefined
          : undefined,


      minPrice,

      maxPrice,

      page,

      pageSize,
    };


    const [data, total] =
      await Promise.all([
        findAllProperties(
          filters
        ),

        countProperties(
          filters
        ),
      ]);


    const actualPageSize =
      Math.min(
        pageSize,
        100
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
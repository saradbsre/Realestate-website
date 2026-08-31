import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";


/* =========================================================
   BUILDING IMAGES
========================================================= */

export async function findPublicBuildingImages(
  buildingId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .query(`
        SELECT
            imageId,
            imagePath,
            fileName,
            displayOrder,
            isPrimary

        FROM dbo.build_images

        WHERE
            LTRIM(RTRIM(buildingId))
            =
            LTRIM(RTRIM(@BuildingId))

            AND ISNULL(
                isActive,
                1
            ) = 1

        ORDER BY
            isPrimary DESC,
            displayOrder ASC,
            imageId ASC;
      `);

  return result.recordset;
}


/* =========================================================
   UNIT IMAGES

   Unit unique key:
   build_id + unit_desc
========================================================= */

export async function findPublicUnitImages(
  buildingId: string,
  unitDesc: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(15),
        unitDesc
      )

      .query(`
        SELECT
            imageId,
            imagePath,
            fileName,
            displayOrder,
            isPrimary

        FROM dbo.unit_images

        WHERE
            LTRIM(RTRIM(buildingId))
            =
            LTRIM(RTRIM(@BuildingId))

            AND LTRIM(RTRIM(unitDesc))
            =
            LTRIM(RTRIM(@UnitDesc))

            AND ISNULL(
                isActive,
                1
            ) = 1

        ORDER BY
            isPrimary DESC,
            displayOrder ASC,
            imageId ASC;
      `);

  return result.recordset;
}
import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";

/* =========================================================
   TYPES
========================================================= */

export interface CreateUpcomingProjectInput {
  buildId: string;
  buildingName: string;
  placeId: string;
  areaId: string;
  buildArea: number | null;
}

/* =========================================================
   GET PLACES
========================================================= */

export async function findPlaces() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(RTRIM(place_id))
                AS placeId,

            LTRIM(RTRIM(place_desc))
                AS placeName,

            LTRIM(RTRIM(Coun_ID))
                AS countryId

        FROM dbo.Place

        WHERE
            place_id IS NOT NULL

            AND LTRIM(
                RTRIM(
                    ISNULL(
                        place_desc,
                        ''
                    )
                )
            ) <> ''

        ORDER BY
            place_desc ASC;
      `);

  return result.recordset;
}

/* =========================================================
   GET AREAS BY PLACE
========================================================= */

export async function findAreasByPlace(
  placeId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "PlaceId",
        sql.NVarChar(20),
        placeId
      )

      .query(`
        SELECT
            LTRIM(RTRIM(area_id))
                AS areaId,

            LTRIM(RTRIM(area_desc))
                AS areaName,

            LTRIM(RTRIM(place_id))
                AS placeId

        FROM dbo.Area

        WHERE
            LTRIM(RTRIM(place_id))
                =
            LTRIM(RTRIM(@PlaceId))

            AND area_id IS NOT NULL

            AND LTRIM(
                RTRIM(
                    ISNULL(
                        area_desc,
                        ''
                    )
                )
            ) <> ''

        ORDER BY
            area_desc ASC;
      `);

  return result.recordset;
}

/* =========================================================
   CHECK BUILDING ID
========================================================= */

export async function findBuildingById(
  buildId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildId",
        sql.NVarChar(20),
        buildId
      )

      .query(`
        SELECT TOP 1
            build_id

        FROM dbo.building

        WHERE
            LTRIM(RTRIM(build_id))
                =
            LTRIM(RTRIM(@BuildId));
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/* =========================================================
   VALIDATE PLACE + AREA
========================================================= */

export async function findPlaceArea(
  placeId: string,
  areaId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "PlaceId",
        sql.NVarChar(20),
        placeId
      )

      .input(
        "AreaId",
        sql.NVarChar(20),
        areaId
      )

      .query(`
        SELECT TOP 1
            LTRIM(RTRIM(P.place_id))
                AS placeId,

            LTRIM(RTRIM(P.Coun_ID))
                AS countryId,

            LTRIM(RTRIM(A.area_id))
                AS areaId

        FROM dbo.Place P

        INNER JOIN dbo.Area A
            ON LTRIM(RTRIM(A.place_id))
             =
               LTRIM(RTRIM(P.place_id))

        WHERE
            LTRIM(RTRIM(P.place_id))
                =
            LTRIM(RTRIM(@PlaceId))

            AND LTRIM(RTRIM(A.area_id))
                =
            LTRIM(RTRIM(@AreaId));
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/* =========================================================
   INSERT BUILDING
========================================================= */

export async function createUpcomingProject(
  data: CreateUpcomingProjectInput,
  countryId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const request =
    pool.request();

  request.input(
    "BuildId",
    sql.NVarChar(7),
    data.buildId
  );

  request.input(
    "BuildingName",
    sql.NVarChar(300),
    data.buildingName
  );

  request.input(
    "CountryId",
    sql.NVarChar(20),
    countryId
  );

  request.input(
    "PlaceId",
    sql.NVarChar(20),
    data.placeId
  );

  request.input(
    "AreaId",
    sql.NVarChar(20),
    data.areaId
  );

  request.input(
    "BuildArea",
    sql.Decimal(18, 2),
    data.buildArea
  );

  request.input(
    "IsUpcomingProject",
    sql.Bit,
    1
  );
  request.input(
  "LandlordId",
  sql.NVarChar(20),
  "L001"
);
  request.input(
  "bldg_cat_id",
  sql.NVarChar(20),
  "P001"
);

  await request.query(`
    INSERT INTO dbo.building
    (
        build_id,
        coun_id,
        place_id,
        area_id,
        build_desc,
        build_area,
         landlord_id,
         bldg_cat_id,
        IsUpcomingProject,
        IsActive,
        sysdate,
        userid
    )
    VALUES
    (
        @BuildId,
        @CountryId,
        @PlaceId,
        @AreaId,
        @BuildingName,
        @BuildArea,
            @LandlordId,
            @bldg_cat_id,
        @IsUpcomingProject,
        0,
        GETDATE(),
        'WEBSITE'
    );
  `);

  return {
    buildId:
      data.buildId,

    buildingName:
      data.buildingName,

    placeId:
      data.placeId,

    areaId:
      data.areaId,

    buildArea:
      data.buildArea,

    isUpcomingProject:
      true,
  };
}

export async function findUpcomingProjects() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(RTRIM(B.build_id))
                AS id,

            LTRIM(RTRIM(B.build_desc))
                AS title,

            LTRIM(RTRIM(B.place_id))
                AS placeId,

            LTRIM(RTRIM(P.place_desc))
                AS placeName,

            LTRIM(RTRIM(B.area_id))
                AS areaId,

            LTRIM(RTRIM(A.area_desc))
                AS areaName,

            B.build_area
                AS buildArea,

            B.ImagePic
                AS image,

            B.build_notes
                AS description,

            ISNULL(
                B.IsUpcomingProject,
                0
            )
                AS isUpcomingProject,

            ISNULL(
                B.IsActive,
                1
            )
                AS isActive

        FROM dbo.building B

        INNER JOIN dbo.Place P
            ON LTRIM(RTRIM(P.place_id))
             =
               LTRIM(RTRIM(B.place_id))

        LEFT JOIN dbo.Area A
            ON LTRIM(RTRIM(A.area_id))
             =
               LTRIM(RTRIM(B.area_id))

            AND LTRIM(RTRIM(A.place_id))
             =
               LTRIM(RTRIM(B.place_id))

        WHERE
            ISNULL(
                B.IsUpcomingProject,
                0
            ) = 1

            AND ISNULL(
                B.IsActive,
                0
            ) = 0

        ORDER BY
            B.sysdate DESC,
            B.build_desc ASC;
      `);

  return result.recordset;
}

export async function updateUpcomingProject(
  buildId: string,
  data: {
    buildingName: string;
    placeId: string;
    areaId: string;
    buildArea: number | null;
  }
) {
  const pool = await getBinShabibEstateNet();

  await pool
    .request()
    .input(
      "BuildId",
      sql.NVarChar(7),
      buildId
    )
    .input(
      "BuildingName",
      sql.NVarChar(300),
      data.buildingName
    )
    .input(
      "PlaceId",
      sql.NVarChar(20),
      data.placeId
    )
    .input(
      "AreaId",
      sql.NVarChar(20),
      data.areaId
    )
    .input(
      "BuildArea",
      sql.Decimal(18, 2),
      data.buildArea
    )
    .query(`
      UPDATE dbo.building
      SET
          build_desc = @BuildingName,
          place_id = @PlaceId,
          area_id = @AreaId,
          build_area = @BuildArea,
          sysdate = GETDATE(),
          userid = 'WEBSITE'
      WHERE
          LTRIM(RTRIM(build_id))
            = LTRIM(RTRIM(@BuildId))
          AND ISNULL(IsUpcomingProject, 0) = 1;
    `);
}

export async function deleteUpcomingProject(
  buildId: string
) {
  const pool =
    await getBinShabibEstateNet();

  await pool
    .request()
    .input(
      "BuildId",
      sql.NVarChar(7),
      buildId
    )
    .query(`
      UPDATE dbo.building
      SET
          IsUpcomingProject = 0,
          sysdate = GETDATE(),
          userid = 'WEBSITE'
      WHERE
          LTRIM(RTRIM(build_id))
            = LTRIM(RTRIM(@BuildId))
          AND ISNULL(IsUpcomingProject, 0) = 1;
    `);
}

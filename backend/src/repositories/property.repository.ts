import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export interface PropertySearchParams {
  search?: string;
 buildingId?: string;

  unitDesc?: string;
  unitTypeId?: number;

  beds?: string;

  minPrice?: number;

  maxPrice?: number;

  minArea?: number;

  maxArea?: number;


  page?: number;

  pageSize?: number;

    view?: "building" | "unitType";
}

export async function findAllProperties(
  filters: PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const page =
    Number.isInteger(
      filters.page
    ) &&
    Number(
      filters.page
    ) > 0
      ? Number(
          filters.page
        )
      : 1;

  const requestedPageSize =
    Number.isInteger(
      filters.pageSize
    ) &&
    Number(
      filters.pageSize
    ) > 0
      ? Number(
          filters.pageSize
        )
      : 20;

  const pageSize =
    Math.min(
      requestedPageSize,
      100
    );

  const offset =
    (
      page -
      1
    ) *
    pageSize;

  const normalizedSearch =
    filters.search
      ?.replace(
        /,/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim() ||
    null;

  const request =
    db
      .request()

      .input(
        "Search",
        sql.NVarChar(
          300
        ),
        normalizedSearch
      )

      .input(
        "UnitTypeId",
        sql.Int,
        filters.unitTypeId ??
          null
      )

      .input(
        "Beds",
        sql.NVarChar(
          10
        ),
        filters.beds ||
          null
      )

      .input(
        "MinPrice",
        sql.Decimal(
          18,
          2
        ),
        filters.minPrice ??
          null
      )

      .input(
        "MaxPrice",
        sql.Decimal(
          18,
          2
        ),
        filters.maxPrice ??
          null
      )

      .input(
        "MinArea",
        sql.Decimal(
          18,
          2
        ),
        filters.minArea ??
          null
      )

      .input(
        "MaxArea",
        sql.Decimal(
          18,
          2
        ),
        filters.maxArea ??
          null
      )

      .input(
        "Offset",
        sql.Int,
        offset
      )

      .input(
  "BuildingId",
  sql.NVarChar(7),
  filters.buildingId
    ?.trim() ||
    null
)

.input(
  "UnitDesc",
  sql.NVarChar(255),
  filters.unitDesc
    ?.trim() ||
    null
)

      .input(
        "PageSize",
        sql.Int,
        pageSize
      );

  const result =
    await request.query(`
      /* =====================================================
         ELIGIBLE VACANT UNITS
      ===================================================== */

      WITH EligibleUnits AS
      (
          SELECT
              U.*

          FROM dbo.unit U

          WHERE
              ISNULL(
                  U.IsActive,
                  1
              ) = 1

              AND ISNULL(
                  U.unit_vacant,
                  'N'
              ) = 'Y'


              /* =========================================
                 PROPERTY TYPE
              ========================================= */

              AND
              (
                  @UnitTypeId IS NULL

                  OR EXISTS
                  (
                      SELECT 1

                      FROM dbo.vw_UnitType VUT

                      WHERE
                          VUT.UnitTypeId =
                              @UnitTypeId

                          AND LTRIM(
                              RTRIM(
                                  VUT.PurposeCode
                              )
                          )
                          =
                          LTRIM(
                              RTRIM(
                                  U.Purpose_type
                              )
                          )
                  )
              )


              /* =========================================
                 BEDS / PURPOSE CODE
              ========================================= */

              AND
              (
                  @Beds IS NULL

                  OR LTRIM(
                      RTRIM(
                          U.Purpose_type
                      )
                  )
                  =
                  LTRIM(
                      RTRIM(
                          @Beds
                      )
                  )
              )


              /* =========================================
                 PRICE
              ========================================= */

              AND
              (
                  @MinPrice IS NULL

                  OR U.unit_annual_rent >=
                     @MinPrice
              )

              AND
              (
                  @MaxPrice IS NULL

                  OR U.unit_annual_rent <=
                     @MaxPrice
              )


              /* =========================================
                 AREA
              ========================================= */

              AND
              (
                  @MinArea IS NULL

                  OR U.unit_areasqft >=
                     @MinArea
              )

              AND
              (
                  @MaxArea IS NULL

                  OR U.unit_areasqft <=
                     @MaxArea
              )

                        AND
            (
                @BuildingId IS NULL

                OR LTRIM(
                    RTRIM(
                        U.build_id
                    )
                )
                =
                LTRIM(
                    RTRIM(
                        @BuildingId
                    )
                )
            )

            AND
            (
                @UnitDesc IS NULL

                OR LTRIM(
                    RTRIM(
                        U.unit_desc
                    )
                )
                =
                LTRIM(
                    RTRIM(
                        @UnitDesc
                    )
                )
            )
      ),


      /* =====================================================
         BUILDING + UNIT TYPE GROUPS

         Example:

         P:363 + STD
         P:363 + SHP
      ===================================================== */

      ListingGroups AS
      (
          SELECT
              EU.build_id,

              LTRIM(
                  RTRIM(
                      EU.Purpose_type
                  )
              ) AS purposeCode

          FROM EligibleUnits EU

          GROUP BY
              EU.build_id,

              LTRIM(
                  RTRIM(
                      EU.Purpose_type
                  )
              )
      )


      SELECT

          /* =========================================
             UNIQUE LISTING ID
          ========================================= */

          LTRIM(
              RTRIM(
                  B.build_id
              )
          )
          +
          '|'
          +
          LG.purposeCode
              AS listingId,


          /* =========================================
             BUILDING
          ========================================= */

          LTRIM(
              RTRIM(
                  B.build_id
              )
          ) AS id,

          LTRIM(
              RTRIM(
                  B.build_desc
              )
          ) AS title,

          BT.bldg_cat_desc
              AS buildingType,

          B.build_Add
              AS address,

          A.area_desc
              AS areaName,

          P.place_desc
              AS placeName,

          B.build_neigh
              AS neighborhood,


          /* =========================================
             LOCATION
          ========================================= */

          STUFF(
              CASE
                  WHEN NULLIF(
                      LTRIM(
                          RTRIM(
                              B.build_Add
                          )
                      ),
                      ''
                  ) IS NOT NULL

                  THEN
                      ', ' +
                      LTRIM(
                          RTRIM(
                              B.build_Add
                          )
                      )

                  ELSE ''
              END

              +

              CASE
                  WHEN NULLIF(
                      LTRIM(
                          RTRIM(
                              A.area_desc
                          )
                      ),
                      ''
                  ) IS NOT NULL

                  THEN
                      ', ' +
                      LTRIM(
                          RTRIM(
                              A.area_desc
                          )
                      )

                  ELSE ''
              END

              +

              CASE
                  WHEN NULLIF(
                      LTRIM(
                          RTRIM(
                              P.place_desc
                          )
                      ),
                      ''
                  ) IS NOT NULL

                  THEN
                      ', ' +
                      LTRIM(
                          RTRIM(
                              P.place_desc
                          )
                      )

                  ELSE ''
              END,

              1,
              2,
              ''
          ) AS location,


          /* =========================================
             BUILDING DETAILS
          ========================================= */

          B.plot_no
              AS plotNumber,

          B.makaniNo
              AS makaniNumber,

          B.build_floor
              AS buildingFloors,

          B.build_lift
              AS lifts,

          B.build_carparks
              AS carParks,

          B.build_area
              AS buildingArea,

          B.BuildingNature
              AS buildingNature,

          B.IsVilla
              AS isVilla,

          CAST(
              B.WebDisplayOrder
              AS INT
          ) AS webDisplayOrder,


          /* =========================================
             UNIT TYPE
          ========================================= */

          LG.purposeCode
              AS purposeCode,

          MAX(
              UPT.Descr
          ) AS propertyType,

          MAX(
              UPT.Descr
          ) AS availableTypes,


          /* =========================================
             VACANT COUNT FOR THIS TYPE
          ========================================= */

          COUNT_BIG(
              *
          ) AS vacantUnits,


          /* =========================================
             PRICE FOR THIS TYPE
          ========================================= */

          MIN(
              U.unit_annual_rent
          ) AS price,

          MAX(
              U.unit_annual_rent
          ) AS maxPrice,

          'AED'
              AS currency,

          'Yearly'
              AS rentalPeriod,


          /* =========================================
             AREA FOR THIS TYPE
          ========================================= */

          MIN(
              U.unit_areasqft
          ) AS area,

          MAX(
              U.unit_areasqft
          ) AS maxArea,

          'Sq.Ft.'
              AS areaUnit,


          /* =========================================
             PURPOSE
          ========================================= */

          'Rent'
              AS purpose,


          /* =========================================
             UNIT REFERENCE
          ========================================= */

          MIN(
              U.Unit_RefNo
          ) AS referenceNo,


          /* =========================================
             BUILDING + UNIT IMAGE GALLERY

             JSON is returned as text and parsed
             in controller.
          ========================================= */

          (
              SELECT
                  IMG.imagePath,

                  IMG.imageType,

                  IMG.displayOrder,

                  IMG.imageId

              FROM
              (
                  /* -------------------------------------
                     BUILDING IMAGES
                  ------------------------------------- */

                  SELECT
                      BI.imagePath,

                      'BUILDING'
                          AS imageType,

                      BI.displayOrder,

                      BI.imageId

                  FROM dbo.build_images BI

                  WHERE
                      LTRIM(
                          RTRIM(
                              BI.buildingId
                          )
                      )
                      =
                      LTRIM(
                          RTRIM(
                              B.build_id
                          )
                      )

                      AND ISNULL(
                          BI.isActive,
                          1
                      ) = 1


                  UNION ALL


                  /* -------------------------------------
                     UNIT IMAGES

                     Only units belonging to this
                     Purpose_type.
                  ------------------------------------- */

                  SELECT
                      UI.imagePath,

                      'UNIT'
                          AS imageType,

                      UI.displayOrder,

                      UI.imageId

                  FROM dbo.unit_images UI

                  INNER JOIN dbo.unit UIMG
                      ON LTRIM(
                          RTRIM(
                              UIMG.build_id
                          )
                      )
                      =
                      LTRIM(
                          RTRIM(
                              UI.buildingId
                          )
                      )

                      AND LTRIM(
                          RTRIM(
                              UIMG.unit_desc
                          )
                      )
                      =
                      LTRIM(
                          RTRIM(
                              UI.unitDesc
                          )
                      )

                  WHERE
                      LTRIM(
                          RTRIM(
                              UI.buildingId
                          )
                      )
                      =
                      LTRIM(
                          RTRIM(
                              B.build_id
                          )
                      )

                      AND LTRIM(
                          RTRIM(
                              UIMG.Purpose_type
                          )
                      )
                      =
                      LG.purposeCode

                      AND ISNULL(
                          UI.isActive,
                          1
                      ) = 1

                      AND ISNULL(
                          UIMG.IsActive,
                          1
                      ) = 1

                      AND ISNULL(
                          UIMG.unit_vacant,
                          'N'
                      ) = 'Y'

              ) IMG

              ORDER BY
                  CASE
                      WHEN IMG.imageType =
                           'BUILDING'
                      THEN 0
                      ELSE 1
                  END,

                  IMG.displayOrder ASC,

                  IMG.imageId ASC

              FOR JSON PATH
          ) AS imagePaths,


          MAX(
              U.Unit_NPayment
          ) AS numberOfPayments,

          MAX(
              U.sysdate
          ) AS lastUpdated


      FROM ListingGroups LG


      INNER JOIN EligibleUnits U
          ON LTRIM(
              RTRIM(
                  U.build_id
              )
          )
          =
          LTRIM(
              RTRIM(
                  LG.build_id
              )
          )

          AND LTRIM(
              RTRIM(
                  U.Purpose_type
              )
          )
          =
          LG.purposeCode


      INNER JOIN dbo.building B
          ON LTRIM(
              RTRIM(
                  B.build_id
              )
          )
          =
          LTRIM(
              RTRIM(
                  LG.build_id
              )
          )


      LEFT JOIN dbo.building_type BT
          ON BT.bldg_cat_id =
             B.bldg_cat_id


      LEFT JOIN dbo.area A
          ON A.area_id =
             B.area_id


      LEFT JOIN dbo.place P
          ON P.place_id =
             B.place_id


      LEFT JOIN dbo.Unit_Purpose_Type UPT
          ON LTRIM(
              RTRIM(
                  UPT.Code
              )
          )
          =
          LG.purposeCode


      WHERE
          ISNULL(
              B.IsActive,
              1
          ) = 1

          AND
          (
              B.WebDisplayOrder
                  IS NULL

              OR B.WebDisplayOrder
                  BETWEEN 1 AND 6
          )


          /* =========================================
             LOCATION SEARCH
          ========================================= */

          AND
          (
              @Search IS NULL

              OR LTRIM(
                  RTRIM(
                      ISNULL(
                          B.build_Add,
                          ''
                      )
                  )
              )
              LIKE
                  '%' +
                  @Search +
                  '%'

              OR LTRIM(
                  RTRIM(
                      ISNULL(
                          B.build_neigh,
                          ''
                      )
                  )
              )
              LIKE
                  '%' +
                  @Search +
                  '%'

              OR LTRIM(
                  RTRIM(
                      ISNULL(
                          A.area_desc,
                          ''
                      )
                  )
              )
              LIKE
                  '%' +
                  @Search +
                  '%'

              OR LTRIM(
                  RTRIM(
                      ISNULL(
                          P.place_desc,
                          ''
                      )
                  )
              )
              LIKE
                  '%' +
                  @Search +
                  '%'

              OR LTRIM(
                  RTRIM(
                      ISNULL(
                          B.build_Add,
                          ''
                      )
                      + ' ' +
                      ISNULL(
                          B.build_neigh,
                          ''
                      )
                      + ' ' +
                      ISNULL(
                          A.area_desc,
                          ''
                      )
                      + ' ' +
                      ISNULL(
                          P.place_desc,
                          ''
                      )
                  )
              )
              LIKE
                  '%' +
                  @Search +
                  '%'
          )


      GROUP BY
          B.build_id,

          B.build_desc,

          BT.bldg_cat_desc,

          B.build_Add,

          A.area_desc,

          P.place_desc,

          B.build_neigh,

          B.plot_no,

          B.makaniNo,

          B.build_floor,

          B.build_lift,

          B.build_carparks,

          B.build_area,

          B.BuildingNature,

          B.IsVilla,

          B.WebDisplayOrder,

          LG.purposeCode


      /* =============================================
         BUILDING PRIORITY FIRST
      ============================================= */

      ORDER BY

          CASE
              WHEN B.WebDisplayOrder
                   BETWEEN 1 AND 6
              THEN 0

              ELSE 1
          END ASC,

          CASE
              WHEN B.WebDisplayOrder
                   BETWEEN 1 AND 6
              THEN B.WebDisplayOrder

              ELSE 99
          END ASC,

          B.build_desc ASC,

          CASE
              WHEN LG.purposeCode = 'STD'
                  THEN 1

              WHEN LG.purposeCode = '1BK'
                  THEN 2

              WHEN LG.purposeCode = '2BK'
                  THEN 3

              WHEN LG.purposeCode = '3BK'
                  THEN 4

              WHEN LG.purposeCode = '4BK'
                  THEN 5

              WHEN LG.purposeCode = 'VIL'
                  THEN 6

              WHEN LG.purposeCode = 'OFF'
                  THEN 7

              WHEN LG.purposeCode = 'SHP'
                  THEN 8

              WHEN LG.purposeCode = 'SHW'
                  THEN 9

              WHEN LG.purposeCode = 'LBR'
                  THEN 10

              WHEN LG.purposeCode = 'WRH'
                  THEN 11

              ELSE 99
          END


      OFFSET @Offset ROWS

      FETCH NEXT @PageSize
      ROWS ONLY;
  `);

  return result.recordset;
}


export async function findFeaturedProperties(
  filters: PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const page =
    Number.isInteger(
      filters.page
    ) &&
    Number(filters.page) > 0
      ? Number(filters.page)
      : 1;

  const requestedPageSize =
    Number.isInteger(
      filters.pageSize
    ) &&
    Number(filters.pageSize) > 0
      ? Number(filters.pageSize)
      : 6;

  const pageSize =
    Math.min(
      requestedPageSize,
      20
    );

  const offset =
    (page - 1) *
    pageSize;

  const normalizedSearch =
    filters.search
      ?.replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim() ||
    null;

  const result =
    await db
      .request()

      .input(
        "Search",
        sql.NVarChar(300),
        normalizedSearch
      )

      .input(
        "UnitTypeId",
        sql.Int,
        filters.unitTypeId ??
          null
      )

      .input(
        "Beds",
        sql.NVarChar(10),
        filters.beds ||
          null
      )

      .input(
        "MinPrice",
        sql.Decimal(18, 2),
        filters.minPrice ??
          null
      )

      .input(
        "MaxPrice",
        sql.Decimal(18, 2),
        filters.maxPrice ??
          null
      )

      .input(
        "MinArea",
        sql.Decimal(18, 2),
        filters.minArea ??
          null
      )

      .input(
        "MaxArea",
        sql.Decimal(18, 2),
        filters.maxArea ??
          null
      )

      .input(
        "Offset",
        sql.Int,
        offset
      )

      .input(
        "PageSize",
        sql.Int,
        pageSize
      )

      .query(`
        /* ===================================================
           ELIGIBLE VACANT UNITS
        =================================================== */

        WITH EligibleUnits AS
        (
            SELECT
                U.*

            FROM dbo.unit U

            WHERE
                ISNULL(
                    U.IsActive,
                    1
                ) = 1

                AND ISNULL(
                    U.unit_vacant,
                    'N'
                ) = 'Y'


                /* =========================================
                   PROPERTY TYPE FILTER
                ========================================= */

                AND
                (
                    @UnitTypeId IS NULL

                    OR EXISTS
                    (
                        SELECT 1

                        FROM dbo.vw_UnitType VUT

                        WHERE
                            VUT.UnitTypeId =
                                @UnitTypeId

                            AND LTRIM(
                                RTRIM(
                                    VUT.PurposeCode
                                )
                            )
                            =
                            LTRIM(
                                RTRIM(
                                    U.Purpose_type
                                )
                            )
                    )
                )


                /* =========================================
                   BED / PURPOSE FILTER
                ========================================= */

                AND
                (
                    @Beds IS NULL

                    OR LTRIM(
                        RTRIM(
                            U.Purpose_type
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            @Beds
                        )
                    )
                )


                /* =========================================
                   PRICE
                ========================================= */

                AND
                (
                    @MinPrice IS NULL

                    OR U.unit_annual_rent >=
                       @MinPrice
                )

                AND
                (
                    @MaxPrice IS NULL

                    OR U.unit_annual_rent <=
                       @MaxPrice
                )


                /* =========================================
                   AREA
                ========================================= */

                AND
                (
                    @MinArea IS NULL

                    OR U.unit_areasqft >=
                       @MinArea
                )

                AND
                (
                    @MaxArea IS NULL

                    OR U.unit_areasqft <=
                       @MaxArea
                )
        )


        SELECT

            /* ===============================================
               UNIQUE CARD ID

               Building wise:
               listingId = building ID
            =============================================== */

            LTRIM(
                RTRIM(
                    B.build_id
                )
            ) AS listingId,


            /* ===============================================
               BUILDING
            =============================================== */

            LTRIM(
                RTRIM(
                    B.build_id
                )
            ) AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            ) AS title,

            BT.bldg_cat_desc
                AS buildingType,

            B.build_Add
                AS address,

            A.area_desc
                AS areaName,

            P.place_desc
                AS placeName,

            B.build_neigh
                AS neighborhood,


            /* ===============================================
               LOCATION
            =============================================== */

            STUFF(
                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                B.build_Add
                            )
                        ),
                        ''
                    ) IS NOT NULL
                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                B.build_Add
                            )
                        )
                    ELSE ''
                END

                +

                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                A.area_desc
                            )
                        ),
                        ''
                    ) IS NOT NULL
                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                A.area_desc
                            )
                        )
                    ELSE ''
                END

                +

                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                P.place_desc
                            )
                        ),
                        ''
                    ) IS NOT NULL
                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                P.place_desc
                            )
                        )
                    ELSE ''
                END,

                1,
                2,
                ''
            ) AS location,


            /* ===============================================
               BUILDING DETAILS
            =============================================== */

            B.plot_no
                AS plotNumber,

            B.makaniNo
                AS makaniNumber,

            B.build_floor
                AS buildingFloors,

            B.build_lift
                AS lifts,

            B.build_carparks
                AS carParks,

            B.build_area
                AS buildingArea,

            B.BuildingNature
                AS buildingNature,

            B.IsVilla
                AS isVilla,

            CAST(
                B.WebDisplayOrder
                AS INT
            ) AS webDisplayOrder,


            /* ===============================================
               ALL AVAILABLE UNIT TYPES

               Example:
               Studio,1 Bedroom Flat,2 Bedroom Flat,Shop
            =============================================== */

            STUFF(
                (
                    SELECT DISTINCT
                        ', ' +
                        LTRIM(
                            RTRIM(
                                ISNULL(
                                    UPT2.Descr,
                                    EU2.Purpose_type
                                )
                            )
                        )

                    FROM EligibleUnits EU2

                    LEFT JOIN dbo.Unit_Purpose_Type UPT2
                        ON LTRIM(
                            RTRIM(
                                UPT2.Code
                            )
                        )
                        =
                        LTRIM(
                            RTRIM(
                                EU2.Purpose_type
                            )
                        )

                    WHERE
                        LTRIM(
                            RTRIM(
                                EU2.build_id
                            )
                        )
                        =
                        LTRIM(
                            RTRIM(
                                B.build_id
                            )
                        )

                    FOR XML PATH(''),
                    TYPE
                ).value(
                    '.',
                    'NVARCHAR(MAX)'
                ),

                1,
                2,
                ''
            ) AS availableTypes,


            /* ===============================================
               TOTAL VACANT UNITS IN BUILDING
            =============================================== */

            COUNT_BIG(*)
                AS vacantUnits,


            /* ===============================================
               BUILDING STARTING / MAX RENT
            =============================================== */

            MIN(
                U.unit_annual_rent
            ) AS price,

            MAX(
                U.unit_annual_rent
            ) AS maxPrice,

            'AED'
                AS currency,

            'Yearly'
                AS rentalPeriod,


            /* ===============================================
               BUILDING UNIT AREA RANGE
            =============================================== */

            MIN(
                U.unit_areasqft
            ) AS area,

            MAX(
                U.unit_areasqft
            ) AS maxArea,

            'Sq.Ft.'
                AS areaUnit,


            /* ===============================================
               PURPOSE
            =============================================== */

            'Rent'
                AS purpose,


            /* ===============================================
               REFERENCE
            =============================================== */

            MIN(
                U.Unit_RefNo
            ) AS referenceNo,


            /* ===============================================
               PRIMARY BUILDING IMAGE

               Home Featured Properties should show
               building image, not unit image.
            =============================================== */

            (
                SELECT TOP 1
                    BI.imagePath

                FROM dbo.build_images BI

                WHERE
                    LTRIM(
                        RTRIM(
                            BI.buildingId
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            B.build_id
                        )
                    )

                    AND ISNULL(
                        BI.isActive,
                        1
                    ) = 1

                ORDER BY
                    CASE
                        WHEN ISNULL(
                            BI.isPrimary,
                            0
                        ) = 1
                        THEN 0
                        ELSE 1
                    END,

                    BI.displayOrder ASC,

                    BI.imageId ASC
            ) AS primaryImagePath,


            /* ===============================================
               IMAGE PATHS

               Optional:
               building gallery available if needed later
            =============================================== */

            (
                SELECT
                    BI.imagePath,

                    'BUILDING'
                        AS imageType,

                    BI.displayOrder,

                    BI.imageId

                FROM dbo.build_images BI

                WHERE
                    LTRIM(
                        RTRIM(
                            BI.buildingId
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            B.build_id
                        )
                    )

                    AND ISNULL(
                        BI.isActive,
                        1
                    ) = 1

                ORDER BY
                    CASE
                        WHEN ISNULL(
                            BI.isPrimary,
                            0
                        ) = 1
                        THEN 0
                        ELSE 1
                    END,

                    BI.displayOrder ASC,

                    BI.imageId ASC

                FOR JSON PATH
            ) AS imagePaths,


            MAX(
                U.Unit_NPayment
            ) AS numberOfPayments,

            MAX(
                U.sysdate
            ) AS lastUpdated


        FROM EligibleUnits U


        INNER JOIN dbo.building B
            ON LTRIM(
                RTRIM(
                    B.build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    U.build_id
                )
            )


        LEFT JOIN dbo.building_type BT
            ON BT.bldg_cat_id =
               B.bldg_cat_id


        LEFT JOIN dbo.area A
            ON A.area_id =
               B.area_id


        LEFT JOIN dbo.place P
            ON P.place_id =
               B.place_id


        WHERE
            ISNULL(
                B.IsActive,
                1
            ) = 1


            AND
            (
                B.WebDisplayOrder
                    IS NULL

                OR B.WebDisplayOrder
                    BETWEEN 1 AND 6
            )


            /* ===============================================
               LOCATION
            =============================================== */

            AND
            (
                @Search IS NULL

                OR LTRIM(
                    RTRIM(
                        ISNULL(
                            B.build_Add,
                            ''
                        )
                    )
                )
                LIKE
                    '%' +
                    @Search +
                    '%'

                OR LTRIM(
                    RTRIM(
                        ISNULL(
                            B.build_neigh,
                            ''
                        )
                    )
                )
                LIKE
                    '%' +
                    @Search +
                    '%'

                OR LTRIM(
                    RTRIM(
                        ISNULL(
                            A.area_desc,
                            ''
                        )
                    )
                )
                LIKE
                    '%' +
                    @Search +
                    '%'

                OR LTRIM(
                    RTRIM(
                        ISNULL(
                            P.place_desc,
                            ''
                        )
                    )
                )
                LIKE
                    '%' +
                    @Search +
                    '%'
            )


        GROUP BY
            B.build_id,

            B.build_desc,

            BT.bldg_cat_desc,

            B.build_Add,

            A.area_desc,

            P.place_desc,

            B.build_neigh,

            B.plot_no,

            B.makaniNo,

            B.build_floor,

            B.build_lift,

            B.build_carparks,

            B.build_area,

            B.BuildingNature,

            B.IsVilla,

            B.WebDisplayOrder


        /* ===============================================
           TOP PRIORITY BUILDINGS FIRST
        =============================================== */

        ORDER BY

            CASE
                WHEN B.WebDisplayOrder
                     BETWEEN 1 AND 6
                THEN 0
                ELSE 1
            END,

            CASE
                WHEN B.WebDisplayOrder
                     BETWEEN 1 AND 6
                THEN B.WebDisplayOrder
                ELSE 99
            END,

            B.build_desc ASC


        OFFSET @Offset ROWS

        FETCH NEXT @PageSize
        ROWS ONLY;
      `);

  return result.recordset;
}

export async function getPropertyFilterOptionsRepo() {
 const db = await getBinShabibEstateNet();

    const result = await db.request().query(`
        SELECT
            UC.ucat_id AS categoryId,
            UC.ucat_Desc AS categoryName,

            VUT.UnitTypeId AS unitTypeId,
            VUT.UnitTypeDesc AS unitTypeName

        FROM dbo.uCategory UC

        LEFT JOIN
        (
            SELECT DISTINCT
                UnitTypeId,
                UnitTypeDesc,

                CASE
                    WHEN UnitTypeDesc IN ('APARTMENT', 'VILLA')
                        THEN 'UC02'

                    WHEN UnitTypeDesc IN (
                        'OFFICE',
                        'SHOP',
                        'SHOW ROOM',
                        'LABOUR CAMP',
                        'WAREHOUSE',
                        'Store'
                    )
                        THEN 'UC01'

                    ELSE NULL
                END AS ucat_id

            FROM dbo.vw_UnitType

            WHERE UnitTypeId <> 99

        ) VUT
            ON VUT.ucat_id = UC.ucat_id

        WHERE
            VUT.UnitTypeId IS NOT NULL

        ORDER BY
            CASE
                WHEN UC.ucat_Desc = 'RESIDENTIAL' THEN 1
                WHEN UC.ucat_Desc = 'COMMERCIAL' THEN 2
                ELSE 3
            END,

            VUT.UnitTypeDesc;
    `);

    return result.recordset;
}
/**
 * Returns the number of grouped listings for pagination.
 *
 * Important:
 * This counts listing groups, not individual ERP units.
 */
export async function countProperties(
  filters: PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const normalizedSearch =
    filters.search
      ?.replace(
        /,/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim() ||
    null;

  const result =
    await db
      .request()

      .input(
        "Search",
        sql.NVarChar(
          300
        ),
        normalizedSearch
      )

      .input(
        "UnitTypeId",
        sql.Int,
        filters.unitTypeId ??
          null
      )

      .input(
        "Beds",
        sql.NVarChar(
          10
        ),
        filters.beds ||
          null
      )

      .input(
        "MinPrice",
        sql.Decimal(
          18,
          2
        ),
        filters.minPrice ??
          null
      )

      .input(
        "MaxPrice",
        sql.Decimal(
          18,
          2
        ),
        filters.maxPrice ??
          null
      )

      .input(
        "MinArea",
        sql.Decimal(
          18,
          2
        ),
        filters.minArea ??
          null
      )
     .input(
  "BuildingId",
  sql.NVarChar(7),
  filters.buildingId
    ?.trim() ||
    null
)

.input(
  "UnitDesc",
  sql.NVarChar(255),
  filters.unitDesc
    ?.trim() ||
    null
)

      .input(
        "MaxArea",
        sql.Decimal(
          18,
          2
        ),
        filters.maxArea ??
          null
      )

      .query(`
        WITH EligibleUnits AS
        (
            SELECT
                U.build_id,

                LTRIM(
                    RTRIM(
                        U.Purpose_type
                    )
                ) AS purposeCode

            FROM dbo.unit U

            WHERE
                ISNULL(
                    U.IsActive,
                    1
                ) = 1

                AND ISNULL(
                    U.unit_vacant,
                    'N'
                ) = 'Y'


                AND
                (
                    @UnitTypeId IS NULL

                    OR EXISTS
                    (
                        SELECT 1

                        FROM dbo.vw_UnitType VUT

                        WHERE
                            VUT.UnitTypeId =
                                @UnitTypeId

                            AND LTRIM(
                                RTRIM(
                                    VUT.PurposeCode
                                )
                            )
                            =
                            LTRIM(
                                RTRIM(
                                    U.Purpose_type
                                )
                            )
                    )
                )


                AND
                (
                    @Beds IS NULL

                    OR LTRIM(
                        RTRIM(
                            U.Purpose_type
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            @Beds
                        )
                    )
                )


                AND
                (
                    @MinPrice IS NULL

                    OR U.unit_annual_rent >=
                       @MinPrice
                )

                AND
                (
                    @MaxPrice IS NULL

                    OR U.unit_annual_rent <=
                       @MaxPrice
                )


                AND
                (
                    @MinArea IS NULL

                    OR U.unit_areasqft >=
                       @MinArea
                )

                AND
                (
                    @MaxArea IS NULL

                    OR U.unit_areasqft <=
                       @MaxArea
                )

                AND
                    (
                        @BuildingId IS NULL

                        OR LTRIM(
                            RTRIM(
                                U.build_id
                            )
                        )
                        =
                        LTRIM(
                            RTRIM(
                                @BuildingId
                            )
                        )
                    )

                    AND
                    (
                        @UnitDesc IS NULL

                        OR LTRIM(
                            RTRIM(
                                U.unit_desc
                            )
                        )
                        =
                        LTRIM(
                            RTRIM(
                                @UnitDesc
                            )
                        )
                    )
        )


        SELECT
            COUNT(*) AS total

        FROM
        (
            SELECT
                B.build_id,

                EU.purposeCode

            FROM EligibleUnits EU

            INNER JOIN dbo.building B
                ON LTRIM(
                    RTRIM(
                        B.build_id
                    )
                )
                =
                LTRIM(
                    RTRIM(
                        EU.build_id
                    )
                )

            LEFT JOIN dbo.area A
                ON A.area_id =
                   B.area_id

            LEFT JOIN dbo.place P
                ON P.place_id =
                   B.place_id

            WHERE
                ISNULL(
                    B.IsActive,
                    1
                ) = 1

                AND
                (
                    B.WebDisplayOrder
                        IS NULL

                    OR B.WebDisplayOrder
                        BETWEEN 1 AND 6
                )


                AND
                (
                    @Search IS NULL

                    OR LTRIM(
                        RTRIM(
                            ISNULL(
                                B.build_Add,
                                ''
                            )
                        )
                    )
                    LIKE
                        '%' +
                        @Search +
                        '%'

                    OR LTRIM(
                        RTRIM(
                            ISNULL(
                                B.build_neigh,
                                ''
                            )
                        )
                    )
                    LIKE
                        '%' +
                        @Search +
                        '%'

                    OR LTRIM(
                        RTRIM(
                            ISNULL(
                                A.area_desc,
                                ''
                            )
                        )
                    )
                    LIKE
                        '%' +
                        @Search +
                        '%'

                    OR LTRIM(
                        RTRIM(
                            ISNULL(
                                P.place_desc,
                                ''
                            )
                        )
                    )
                    LIKE
                        '%' +
                        @Search +
                        '%'
                )

            GROUP BY
                B.build_id,

                EU.purposeCode
        ) X;
      `);

  return Number(
    result.recordset?.[0]
      ?.total ??
      0
  );
}
/**
 * Returns building-level information.
 *
 * Used when the user opens/clicks a property/building.
 */
export async function findPropertyByBuildingId(
  buildingId: string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .query(`
        SELECT
            B.build_id
                AS id,

            B.build_desc
                AS title,

            BT.bldg_cat_desc
                AS buildingType,

            B.build_Add
                AS address,

            A.area_desc
                AS areaName,

            P.place_desc
                AS placeName,

            B.build_neigh
                AS neighborhood,

            STUFF(
                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                B.build_Add
                            )
                        ),
                        ''
                    ) IS NOT NULL

                    THEN ', ' +
                        LTRIM(
                            RTRIM(
                                B.build_Add
                            )
                        )

                    ELSE ''
                END

                +

                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                A.area_desc
                            )
                        ),
                        ''
                    ) IS NOT NULL

                    THEN ', ' +
                        LTRIM(
                            RTRIM(
                                A.area_desc
                            )
                        )

                    ELSE ''
                END

                +

                CASE
                    WHEN NULLIF(
                        LTRIM(
                            RTRIM(
                                P.place_desc
                            )
                        ),
                        ''
                    ) IS NOT NULL

                    THEN ', ' +
                        LTRIM(
                            RTRIM(
                                P.place_desc
                            )
                        )

                    ELSE ''
                END,

                1,
                2,
                ''
            ) AS location,

            B.plot_no
                AS plotNumber,

            B.makaniNo
                AS makaniNumber,

            B.build_floor
                AS buildingFloors,

            B.build_lift
                AS lifts,

            B.build_carparks
                AS carParks,

            B.build_area
                AS buildingArea,

            B.BuildingNature
                AS buildingNature,

            B.IsVilla
                AS isVilla,

            CAST(
                B.WebDisplayOrder
                AS INT
            ) AS webDisplayOrder

        FROM dbo.building B

        LEFT JOIN dbo.building_type BT
            ON BT.bldg_cat_id =
               B.bldg_cat_id

        LEFT JOIN dbo.area A
            ON A.area_id =
               B.area_id

        LEFT JOIN dbo.place P
            ON P.place_id =
               B.place_id

        WHERE
            B.build_id =
                @BuildingId

            AND ISNULL(
                B.IsActive,
                1
            ) = 1

            AND
            (
                B.WebDisplayOrder IS NULL

                OR B.WebDisplayOrder
                    BETWEEN 1 AND 6
            );
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/**
 * Returns all vacant units under the selected building.
 *
 * This should normally be called only when:
 * - property detail page loads unit availability, or
 * - user clicks "2 Vacant Units".
 */
export async function findVacantUnitsByBuildingId(
  buildingId: string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .query(`
        SELECT

            ------------------------------------
            -- UNIT
            ------------------------------------

            U.ucat_id
                AS referenceNo,

            U.unit_master_desc
                AS unitName,

            U.Purpose_type
                AS purposeCode,

            UPT.Descr
                AS propertyType,

            U.unit_desc
                AS description,

            U.unit_floor_no
                AS floorNumber,


            ------------------------------------
            -- AREA
            ------------------------------------

            U.unit_areasqft
                AS area,

            'Sq.Ft.'
                AS areaUnit,


            ------------------------------------
            -- RENT
            ------------------------------------

            U.unit_annual_rent
                AS annualRent,

            U.unit_annual_rent_max
                AS maxAnnualRent,

            'AED'
                AS currency,


            ------------------------------------
            -- PAYMENT
            ------------------------------------

            U.Unit_NPayment
                AS numberOfPayments,


            ------------------------------------
            -- UNIT DETAILS
            ------------------------------------

            U.unit_ac
                AS airConditioning,

            U.unit_painted
                AS painted,

            U.unit_water_met
                AS waterMeter,

            U.unit_elect_met
                AS electricityMeter,

            U.Unit_SecurityDeposit
                AS securityDeposit,

                U.isWithBalcony
    AS isWithBalcony,

            U.Unit_RefNo
                AS unitReference,


            ------------------------------------
            -- STATUS
            ------------------------------------

            U.unit_vacant
                AS vacant,

            U.IsActive
                AS isActive,


            ------------------------------------
            -- IMAGE
            ------------------------------------

            U.imagepic
                AS image,


            ------------------------------------
            -- LAST UPDATE
            ------------------------------------

            U.sysdate
                AS lastUpdated

        FROM dbo.unit U
INNER JOIN dbo.building B
    ON B.build_id =
       U.build_id
        LEFT JOIN dbo.Unit_Purpose_Type UPT
            ON LTRIM(
                RTRIM(
                    UPT.Code
                )
            ) =
            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            )

     WHERE
    U.build_id =
        @BuildingId

    AND ISNULL(
        U.IsActive,
        1
    ) = 1

    AND ISNULL(
        U.unit_vacant,
        'N'
    ) = 'Y'

    AND ISNULL(
        B.IsActive,
        1
    ) = 1

    AND
    (
        B.WebDisplayOrder IS NULL
        OR B.WebDisplayOrder BETWEEN 1 AND 6
    )

            AND ISNULL(
                U.unit_vacant,
                'N'
            ) = 'Y'

        ORDER BY

            CASE
                WHEN U.Purpose_type = 'STD'
                    THEN 1

                WHEN U.Purpose_type = '1BK'
                    THEN 2

                WHEN U.Purpose_type = '2BK'
                    THEN 3

                WHEN U.Purpose_type = '3BK'
                    THEN 4

                WHEN U.Purpose_type = '4BK'
                    THEN 5

                WHEN U.Purpose_type = 'VIL'
                    THEN 6

                WHEN U.Purpose_type = 'OFF'
                    THEN 7

                WHEN U.Purpose_type = 'SHP'
                    THEN 8

                WHEN U.Purpose_type = 'SHW'
                    THEN 9

                WHEN U.Purpose_type = 'LBR'
                    THEN 10

                WHEN U.Purpose_type = 'WRH'
                    THEN 11

                ELSE 99
            END,

            U.unit_floor_no,

            U.Unit_RefNo;
      `);

  return result.recordset;
}
/**
 * Return distinct values required for the website filter dropdowns.
 */
export async function getPropertyFilters() {
  const db = await getBinShabibEstateNet();

  const [
    propertyTypeResult,
    purposeResult,
    priceResult,
  ] = await Promise.all([
    db.request().query(`
      SELECT DISTINCT
          unit_master_desc AS value

      FROM dbo.unit

      WHERE
          ISNULL(IsActive, 1) = 1

          AND unit_master_desc IS NOT NULL

          AND LTRIM(RTRIM(unit_master_desc)) <> ''

      ORDER BY value;
    `),

    db.request().query(`
      SELECT DISTINCT
          Purpose_type AS value

      FROM dbo.unit

      WHERE
          ISNULL(IsActive, 1) = 1

          AND Purpose_type IS NOT NULL

          AND LTRIM(RTRIM(Purpose_type)) <> ''

      ORDER BY value;
    `),

    db.request().query(`
      SELECT
          MIN(unit_annual_rent)
              AS minPrice,

          MAX(unit_annual_rent)
              AS maxPrice

      FROM dbo.unit

      WHERE
          ISNULL(IsActive, 1) = 1

          AND ISNULL(unit_vacant, 0) = 1

          AND unit_annual_rent IS NOT NULL;
    `),
  ]);

  return {
    propertyTypes:
      propertyTypeResult.recordset.map(
        (row) => row.value
      ),

    purposes:
      purposeResult.recordset.map(
        (row) => row.value
      ),

    priceRange: {
      min:
        Number(
          priceResult.recordset?.[0]?.minPrice
        ) || 0,

      max:
        Number(
          priceResult.recordset?.[0]?.maxPrice
        ) || 0,
    },
  };
}

export async function findAllAdminProperties() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(
                RTRIM(
                    B.build_id
                )
            ) AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            ) AS title,

            LTRIM(
                RTRIM(
                    P.place_desc
                )
            ) AS placeName,

            LTRIM(
                RTRIM(
                    A.area_desc
                )
            ) AS areaName,

            CAST(
                B.WebDisplayOrder
                AS INT
            ) AS webDisplayOrder,

            (
                SELECT
                    COUNT(*)

                FROM dbo.unit U2

                WHERE
                    LTRIM(
                        RTRIM(
                            U2.build_id
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            B.build_id
                        )
                    )

                    AND ISNULL(
                        U2.IsActive,
                        1
                    ) = 1

                    AND ISNULL(
                        U2.unit_vacant,
                        'N'
                    ) = 'Y'
            ) AS vacantUnits

        FROM dbo.building B

        LEFT JOIN dbo.place P
            ON LTRIM(
                RTRIM(
                    P.place_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    B.place_id
                )
            )

        LEFT JOIN dbo.area A
            ON LTRIM(
                RTRIM(
                    A.area_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    B.area_id
                )
            )

        WHERE
            ISNULL(
                B.IsUpcomingProject,
                0
            ) = 0

            AND ISNULL(
                B.IsActive,
                1
            ) = 1

            AND EXISTS
            (
                SELECT 1

                FROM dbo.unit U

                WHERE
                    LTRIM(
                        RTRIM(
                            U.build_id
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            B.build_id
                        )
                    )

                    AND ISNULL(
                        U.IsActive,
                        1
                    ) = 1

                    AND ISNULL(
                        U.unit_vacant,
                        'N'
                    ) = 'Y'
            )

        ORDER BY
            CASE
                WHEN B.WebDisplayOrder
                     BETWEEN 1 AND 6
                THEN 0

                WHEN B.WebDisplayOrder
                     IS NULL
                THEN 1

                WHEN B.WebDisplayOrder = 0
                THEN 2

                ELSE 3
            END,

            CASE
                WHEN B.WebDisplayOrder
                     BETWEEN 1 AND 6
                THEN B.WebDisplayOrder

                ELSE 999
            END,

            B.build_desc ASC;
      `);

  return result.recordset;
}

export async function updatePropertyWebDisplay(
  buildId: string,
  webDisplayOrder: number | null
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildId",
        sql.NVarChar(7),
        buildId
      )

      .input(
        "WebDisplayOrder",
        sql.TinyInt,
        webDisplayOrder
      )

      .query(`
        UPDATE dbo.building

        SET
            WebDisplayOrder =
                @WebDisplayOrder,

            sysdate =
                GETDATE(),

            userid =
                'WEBSITE'

        WHERE
            LTRIM(RTRIM(build_id))
              =
            LTRIM(RTRIM(@BuildId));
      `);

  return (
    result.rowsAffected[0] ||
    0
  );
}


export async function findImageManagementBuildings() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(
                RTRIM(
                    B.build_id
                )
            ) AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            ) AS title,

            ISNULL(
                B.IsUpcomingProject,
                0
            ) AS isUpcomingProject,

            ISNULL(
                B.IsActive,
                1
            ) AS isActive

        FROM dbo.building B

        WHERE
            B.build_id IS NOT NULL

            AND LTRIM(
                RTRIM(
                    ISNULL(
                        B.build_desc,
                        ''
                    )
                )
            ) <> ''

            AND
            (
                /* NORMAL ACTIVE BUILDINGS */

                (
                    ISNULL(
                        B.IsUpcomingProject,
                        0
                    ) = 0

                    AND ISNULL(
                        B.IsActive,
                        1
                    ) = 1

                    AND EXISTS
                    (
                        SELECT 1

                        FROM dbo.unit U

                        WHERE
                            LTRIM(
                                RTRIM(
                                    U.build_id
                                )
                            )
                            =
                            LTRIM(
                                RTRIM(
                                    B.build_id
                                )
                            )

                            AND ISNULL(
                                U.IsActive,
                                1
                            ) = 1

                            AND ISNULL(
                                U.unit_vacant,
                                'N'
                            ) = 'Y'
                    )
                )

                OR

                /* UPCOMING BUILDINGS */

                (
                    ISNULL(
                        B.IsUpcomingProject,
                        0
                    ) = 1
                )
            )

        ORDER BY
            CASE
                WHEN ISNULL(
                    B.IsUpcomingProject,
                    0
                ) = 1
                THEN 1
                ELSE 0
            END,

            B.build_desc ASC;
      `);

  return result.recordset;
}


export async function getPropertyBuildingUnitOptionsRepo(
  buildingId?: string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId || null
      )

      .query(`
        /* =============================================
           BUILDINGS
        ============================================= */

        SELECT DISTINCT
            LTRIM(
                RTRIM(
                    B.build_id
                )
            ) AS buildingId,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            ) AS buildingName

        FROM dbo.building B

        WHERE
            ISNULL(
                B.IsActive,
                1
            ) = 1

            AND
            (
                B.WebDisplayOrder
                    IS NULL

                OR B.WebDisplayOrder
                    BETWEEN 1 AND 6
            )

            AND EXISTS
            (
                SELECT 1

                FROM dbo.unit U

                WHERE
                    LTRIM(
                        RTRIM(
                            U.build_id
                        )
                    )
                    =
                    LTRIM(
                        RTRIM(
                            B.build_id
                        )
                    )

                    AND ISNULL(
                        U.IsActive,
                        1
                    ) = 1

                    AND ISNULL(
                        U.unit_vacant,
                        'N'
                    ) = 'Y'
            )

        ORDER BY
            buildingName;


        /* =============================================
           UNITS FOR SELECTED BUILDING
        ============================================= */

        SELECT DISTINCT
            LTRIM(
                RTRIM(
                    U.unit_desc
                )
            ) AS unitDesc,

            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            ) AS purposeCode,

            UPT.Descr
                AS unitType,

            U.unit_annual_rent
                AS annualRent

        FROM dbo.unit U

        INNER JOIN dbo.building B
            ON LTRIM(
                RTRIM(
                    B.build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    U.build_id
                )
            )

        LEFT JOIN dbo.Unit_Purpose_Type UPT
            ON LTRIM(
                RTRIM(
                    UPT.Code
                )
            )
            =
            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            )

        WHERE
            @BuildingId IS NOT NULL

            AND LTRIM(
                RTRIM(
                    U.build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    @BuildingId
                )
            )

            AND ISNULL(
                U.IsActive,
                1
            ) = 1

            AND ISNULL(
                U.unit_vacant,
                'N'
            ) = 'Y'

            AND ISNULL(
                B.IsActive,
                1
            ) = 1

        ORDER BY
            unitDesc;
      `);

const recordsets =
  result.recordsets as
    sql.IRecordSet<any>[];

return {
  buildings:
    recordsets[0] || [],

  units:
    recordsets[1] || [],
};
}
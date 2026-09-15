import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";


/* =========================================================
   TYPES
========================================================= */

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

  view?:
    | "building"
    | "unitType";
}


/* =========================================================
   HELPERS
========================================================= */

function getPagination(
  filters: PropertySearchParams,
  defaultPageSize: number,
  maximumPageSize: number
) {
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
      : defaultPageSize;

  const pageSize =
    Math.min(
      requestedPageSize,
      maximumPageSize
    );

  const offset =
    (
      page -
      1
    ) *
    pageSize;

  return {
    page,
    pageSize,
    offset,
  };
}


function normalizeSearch(
  value:
    string |
    undefined
) {
  return (
    value
      ?.replace(
        /,/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim() ||
    null
  );
}


/* =========================================================
   ALL PROPERTIES

   ONE CARD PER:
   BUILDING + PURPOSE TYPE

   Example:
   P:363 | STD
   P:363 | 1BK
   P:363 | SHP
========================================================= */

export async function findAllProperties(
  filters:
    PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const {
    pageSize,
    offset,
  } =
    getPagination(
      filters,
      20,
      100
    );

  const normalizedSearch =
    normalizeSearch(
      filters.search
    );


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
        "BuildingId",
        sql.NVarChar(
          7
        ),
        filters.buildingId
          ?.trim() ||
          null
      )

      .input(
        "UnitDesc",
        sql.NVarChar(
          255
        ),
        filters.unitDesc
          ?.trim() ||
          null
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
        "PageSize",
        sql.Int,
        pageSize
      )

      .query(`
        /* =================================================
           ELIGIBLE VACANT UNITS
        ================================================= */

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


                /* =====================================
                   BUILDING
                ===================================== */

                AND
                (
                    @BuildingId
                        IS NULL

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


                /* =====================================
                   UNIT
                ===================================== */

                AND
                (
                    @UnitDesc
                        IS NULL

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


                /* =====================================
                   PROPERTY TYPE
                ===================================== */

                AND
                (
                    @UnitTypeId
                        IS NULL

                    OR EXISTS
                    (
                        SELECT
                            1

                        FROM dbo.vw_UnitType
                            VUT

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


                /* =====================================
                   BEDS
                ===================================== */

                AND
                (
                    @Beds
                        IS NULL

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


                /* =====================================
                   PRICE
                ===================================== */

                AND
                (
                    @MinPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        >=
                    @MinPrice
                )

                AND
                (
                    @MaxPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        <=
                    @MaxPrice
                )


                /* =====================================
                   AREA
                ===================================== */

                AND
                (
                    @MinArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        >=
                    @MinArea
                )

                AND
                (
                    @MaxArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        <=
                    @MaxArea
                )
        ),


        /* =================================================
           BUILDING + PURPOSE GROUPS
        ================================================= */

        ListingGroups AS
        (
            SELECT
                EU.build_id,

                LTRIM(
                    RTRIM(
                        EU.Purpose_type
                    )
                )
                    AS purposeCode

            FROM EligibleUnits EU

            GROUP BY
                EU.build_id,

                LTRIM(
                    RTRIM(
                        EU.Purpose_type
                    )
                )
        ),


        /* =================================================
           GROUPED PROPERTY DATA
        ================================================= */

        GroupedProperties AS
        (
            SELECT

                /* =====================================
                   UNIQUE LISTING ID
                ===================================== */

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


                /* =====================================
                   BUILDING
                ===================================== */

                LTRIM(
                    RTRIM(
                        B.build_id
                    )
                )
                    AS id,

                LTRIM(
                    RTRIM(
                        B.build_desc
                    )
                )
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


                /* =====================================
                   LOCATION
                ===================================== */

                STUFF(
                    CASE
                        WHEN NULLIF(
                            LTRIM(
                                RTRIM(
                                    B.build_Add
                                )
                            ),
                            ''
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    B.build_Add
                                )
                            )

                        ELSE
                            ''
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
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    A.area_desc
                                )
                            )

                        ELSE
                            ''
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
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    P.place_desc
                                )
                            )

                        ELSE
                            ''
                    END,

                    1,
                    2,
                    ''
                )
                    AS location,


                /* =====================================
                   BUILDING DETAILS
                ===================================== */

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
                )
                    AS webDisplayOrder,


                /* =====================================
                   UNIT TYPE
                ===================================== */

                LG.purposeCode
                    AS purposeCode,

                MAX(
                    UPT.Descr
                )
                    AS propertyType,

                MAX(
                    UPT.Descr
                )
                    AS availableTypes,


                /* =====================================
                   VACANT UNITS
                ===================================== */

                COUNT_BIG(
                    *
                )
                    AS vacantUnits,


                /* =====================================
                   PRICE
                ===================================== */

                MIN(
                    U.unit_annual_rent
                )
                    AS price,

                MAX(
                    U.unit_annual_rent
                )
                    AS maxPrice,

                'AED'
                    AS currency,

                'Yearly'
                    AS rentalPeriod,


                /* =====================================
                   AREA
                ===================================== */

                MIN(
                    U.unit_areasqft
                )
                    AS area,

                MAX(
                    U.unit_areasqft
                )
                    AS maxArea,

                'Sq.Ft.'
                    AS areaUnit,


                /* =====================================
                   PURPOSE
                ===================================== */

                'Rent'
                    AS purpose,


                /* =====================================
                   REFERENCE NUMBER
                ===================================== */

                MIN(
                    U.Unit_RefNo
                )
                    AS referenceNo,


                /* =====================================
                   BUILDING + UNIT IMAGES
                ===================================== */

                /* ===============================================
   BUILDING + UNIT IMAGE GALLERY
   Compatible with older SQL Server
================================================ */

'[' +
ISNULL(
    STUFF(
        (
            SELECT
                ',' +

                '{' +

                '"imagePath":"' +
                REPLACE(
                    REPLACE(
                        ISNULL(
                            IMG.imagePath,
                            ''
                        ),
                        '\',
                        '\\'
                    ),
                    '"',
                    '\"'
                )
                + '",' +

                '"imageType":"' +
                IMG.imageType
                + '",' +

                '"displayOrder":' +
                CAST(
                    ISNULL(
                        IMG.displayOrder,
                        0
                    )
                    AS NVARCHAR(20)
                )
                + ',' +

                '"imageId":' +
                CAST(
                    IMG.imageId
                    AS NVARCHAR(20)
                )

                + '}'

            FROM
            (
                /* =====================================
                   BUILDING IMAGES
                ===================================== */

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


                /* =====================================
                   UNIT IMAGES
                ===================================== */

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
                    WHEN
                        IMG.imageType =
                        'BUILDING'
                    THEN 0

                    ELSE 1
                END,

                IMG.displayOrder ASC,

                IMG.imageId ASC

            FOR XML PATH(''),
                TYPE
        ).value(
            '.',
            'NVARCHAR(MAX)'
        ),
        1,
        1,
        ''
    ),
    ''
)
+ ']'
    AS imagePaths,


                /* =====================================
                   PAYMENT
                ===================================== */

                MAX(
                    U.Unit_NPayment
                )
                    AS numberOfPayments,


                /* =====================================
                   LAST UPDATE
                ===================================== */

                MAX(
                    U.sysdate
                )
                    AS lastUpdated


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


            LEFT JOIN dbo.Unit_Purpose_Type
                UPT

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

                    OR
                    B.WebDisplayOrder
                        BETWEEN 1 AND 6
                )


                /* =====================================
                   LOCATION SEARCH
                ===================================== */

                AND
                (
                    @Search
                        IS NULL

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
                            +
                            ' '
                            +
                            ISNULL(
                                B.build_neigh,
                                ''
                            )
                            +
                            ' '
                            +
                            ISNULL(
                                A.area_desc,
                                ''
                            )
                            +
                            ' '
                            +
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
        ),


        /* =================================================
           ROW NUMBER PAGINATION

           NO OFFSET / FETCH NEXT
        ================================================= */

        RankedProperties AS
        (
            SELECT
                GP.*,

                ROW_NUMBER()
                OVER
                (
                    ORDER BY

                        /* TOP PRIORITY FIRST */

                        CASE
                            WHEN
                                GP.webDisplayOrder
                                BETWEEN 1 AND 6

                            THEN 0

                            ELSE 1
                        END,


                        /* PRIORITY ORDER */

                        CASE
                            WHEN
                                GP.webDisplayOrder
                                BETWEEN 1 AND 6

                            THEN
                                GP.webDisplayOrder

                            ELSE
                                99
                        END,


                        /* BUILDING */

                        GP.title ASC,


                        /* UNIT TYPE ORDER */

                        CASE
                            WHEN
                                GP.purposeCode =
                                'STD'
                            THEN 1

                            WHEN
                                GP.purposeCode =
                                '1BK'
                            THEN 2

                            WHEN
                                GP.purposeCode =
                                '2BK'
                            THEN 3

                            WHEN
                                GP.purposeCode =
                                '3BK'
                            THEN 4

                            WHEN
                                GP.purposeCode =
                                '4BK'
                            THEN 5

                            WHEN
                                GP.purposeCode =
                                'VIL'
                            THEN 6

                            WHEN
                                GP.purposeCode =
                                'OFF'
                            THEN 7

                            WHEN
                                GP.purposeCode =
                                'SHP'
                            THEN 8

                            WHEN
                                GP.purposeCode =
                                'SHW'
                            THEN 9

                            WHEN
                                GP.purposeCode =
                                'LBR'
                            THEN 10

                            WHEN
                                GP.purposeCode =
                                'WRH'
                            THEN 11

                            ELSE
                                99
                        END,


                        GP.listingId
                )
                    AS rowNum

            FROM GroupedProperties GP
        )


        /* =================================================
           FINAL PAGED RESULTS
        ================================================= */

        SELECT
            *

        FROM RankedProperties

        WHERE
            rowNum >
                @Offset

            AND rowNum <=
                (
                    @Offset +
                    @PageSize
                )

        ORDER BY
            rowNum;
      `);


  return result.recordset;
}


/* =========================================================
   FEATURED PROPERTIES

   ONE CARD PER BUILDING
========================================================= */

export async function findFeaturedProperties(
  filters:
    PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const {
    pageSize,
    offset,
  } =
    getPagination(
      filters,
      6,
      20
    );

  const normalizedSearch =
    normalizeSearch(
      filters.search
    );


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
        "BuildingId",
        sql.NVarChar(
          7
        ),
        filters.buildingId
          ?.trim() ||
          null
      )

      .input(
        "UnitDesc",
        sql.NVarChar(
          255
        ),
        filters.unitDesc
          ?.trim() ||
          null
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
        "PageSize",
        sql.Int,
        pageSize
      )

      .query(`
        /* =================================================
           ELIGIBLE VACANT UNITS
        ================================================= */

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


                /* BUILDING */

                AND
                (
                    @BuildingId
                        IS NULL

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


                /* UNIT */

                AND
                (
                    @UnitDesc
                        IS NULL

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


                /* PROPERTY TYPE */

                AND
                (
                    @UnitTypeId
                        IS NULL

                    OR EXISTS
                    (
                        SELECT 1

                        FROM dbo.vw_UnitType
                            VUT

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


                /* BEDS */

                AND
                (
                    @Beds
                        IS NULL

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


                /* PRICE */

                AND
                (
                    @MinPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        >=
                    @MinPrice
                )

                AND
                (
                    @MaxPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        <=
                    @MaxPrice
                )


                /* AREA */

                AND
                (
                    @MinArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        >=
                    @MinArea
                )

                AND
                (
                    @MaxArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        <=
                    @MaxArea
                )
        ),


        /* =================================================
           BUILDING-WISE GROUP
        ================================================= */

        GroupedProperties AS
        (
            SELECT

                LTRIM(
                    RTRIM(
                        B.build_id
                    )
                )
                    AS listingId,

                LTRIM(
                    RTRIM(
                        B.build_id
                    )
                )
                    AS id,

                LTRIM(
                    RTRIM(
                        B.build_desc
                    )
                )
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


                /* LOCATION */

                STUFF(
                    CASE
                        WHEN NULLIF(
                            LTRIM(
                                RTRIM(
                                    B.build_Add
                                )
                            ),
                            ''
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    B.build_Add
                                )
                            )

                        ELSE
                            ''
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
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    A.area_desc
                                )
                            )

                        ELSE
                            ''
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
                        )
                        IS NOT NULL

                        THEN
                            ', ' +
                            LTRIM(
                                RTRIM(
                                    P.place_desc
                                )
                            )

                        ELSE
                            ''
                    END,

                    1,
                    2,
                    ''
                )
                    AS location,


                /* BUILDING DETAILS */

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
                )
                    AS webDisplayOrder,


                /* =====================================
                   ALL AVAILABLE TYPES
                ===================================== */

                STUFF(
                    (
                        SELECT DISTINCT

                            ', '
                            +
                            LTRIM(
                                RTRIM(
                                    ISNULL(
                                        UPT2.Descr,
                                        EU2.Purpose_type
                                    )
                                )
                            )

                        FROM EligibleUnits
                            EU2

                        LEFT JOIN
                            dbo.Unit_Purpose_Type
                            UPT2

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

                        FOR XML PATH(
                            ''
                        ),
                        TYPE
                    )
                    .value(
                        '.',
                        'NVARCHAR(MAX)'
                    ),

                    1,
                    2,
                    ''
                )
                    AS availableTypes,


                /* VACANT UNITS */

                COUNT_BIG(
                    *
                )
                    AS vacantUnits,


                /* PRICE */

                MIN(
                    U.unit_annual_rent
                )
                    AS price,

                MAX(
                    U.unit_annual_rent
                )
                    AS maxPrice,

                'AED'
                    AS currency,

                'Yearly'
                    AS rentalPeriod,


                /* AREA */

                MIN(
                    U.unit_areasqft
                )
                    AS area,

                MAX(
                    U.unit_areasqft
                )
                    AS maxArea,

                'Sq.Ft.'
                    AS areaUnit,


                /* PURPOSE */

                'Rent'
                    AS purpose,


                /* REFERENCE */

                MIN(
                    U.Unit_RefNo
                )
                    AS referenceNo,


                /* =====================================
                   PRIMARY BUILDING IMAGE
                ===================================== */

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
                )
                    AS primaryImagePath,



'[' +
ISNULL(
    STUFF(
        (
            SELECT
                ',' +

                '{' +

                '"imagePath":"' +
                REPLACE(
                    REPLACE(
                        ISNULL(
                            BI.imagePath,
                            ''
                        ),
                        '\',
                        '\\'
                    ),
                    '"',
                    '\"'
                )
                + '",' +

                '"imageType":"BUILDING",' +

                '"displayOrder":' +
                CAST(
                    ISNULL(
                        BI.displayOrder,
                        0
                    )
                    AS NVARCHAR(20)
                )
                + ',' +

                '"imageId":' +
                CAST(
                    BI.imageId
                    AS NVARCHAR(20)
                )

                + '}'

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

            FOR XML PATH(''),
                TYPE
        ).value(
            '.',
            'NVARCHAR(MAX)'
        ),
        1,
        1,
        ''
    ),
    ''
)
+ ']'
    AS imagePaths,


                MAX(
                    U.Unit_NPayment
                )
                    AS numberOfPayments,

                MAX(
                    U.sysdate
                )
                    AS lastUpdated


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


            LEFT JOIN dbo.building_type
                BT

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

                    OR
                    B.WebDisplayOrder
                        BETWEEN 1 AND 6
                )


                /* =====================================
                   LOCATION
                ===================================== */

                AND
                (
                    @Search
                        IS NULL

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
        ),


        /* =================================================
           ROW NUMBER PAGINATION
        ================================================= */

        RankedProperties AS
        (
            SELECT
                GP.*,

                ROW_NUMBER()
                OVER
                (
                    ORDER BY

                        CASE
                            WHEN
                                GP.webDisplayOrder
                                BETWEEN 1 AND 6
                            THEN 0

                            ELSE 1
                        END,

                        CASE
                            WHEN
                                GP.webDisplayOrder
                                BETWEEN 1 AND 6

                            THEN
                                GP.webDisplayOrder

                            ELSE
                                99
                        END,

                        GP.title ASC,

                        GP.listingId
                )
                    AS rowNum

            FROM GroupedProperties GP
        )


        /* =================================================
           FINAL RESULTS
        ================================================= */

        SELECT
            *

        FROM RankedProperties

        WHERE
            rowNum >
                @Offset

            AND rowNum <=
                (
                    @Offset +
                    @PageSize
                )

        ORDER BY
            rowNum;
      `);


  return result.recordset;
}


/* =========================================================
   PROPERTY FILTER OPTIONS
========================================================= */

export async function getPropertyFilterOptionsRepo() {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()
      .query(`
        SELECT
            UC.ucat_id
                AS categoryId,

            UC.ucat_Desc
                AS categoryName,

            VUT.UnitTypeId
                AS unitTypeId,

            VUT.UnitTypeDesc
                AS unitTypeName

        FROM dbo.uCategory UC

        LEFT JOIN
        (
            SELECT DISTINCT
                UnitTypeId,

                UnitTypeDesc,

                CASE
                    WHEN
                        UnitTypeDesc
                        IN
                        (
                            'APARTMENT',
                            'VILLA'
                        )

                    THEN
                        'UC02'

                    WHEN
                        UnitTypeDesc
                        IN
                        (
                            'OFFICE',
                            'SHOP',
                            'SHOW ROOM',
                            'LABOUR CAMP',
                            'WAREHOUSE',
                            'Store'
                        )

                    THEN
                        'UC01'

                    ELSE
                        NULL
                END
                    AS ucat_id

            FROM dbo.vw_UnitType

            WHERE
                UnitTypeId <> 99

        ) VUT

            ON
                VUT.ucat_id =
                UC.ucat_id

        WHERE
            VUT.UnitTypeId
                IS NOT NULL

        ORDER BY

            CASE
                WHEN
                    UC.ucat_Desc =
                    'RESIDENTIAL'
                THEN 1

                WHEN
                    UC.ucat_Desc =
                    'COMMERCIAL'
                THEN 2

                ELSE 3
            END,

            VUT.UnitTypeDesc;
      `);

  return result.recordset;
}


/* =========================================================
   COUNT PROPERTY GROUPS

   COUNT BUILDING + PURPOSE CODE
========================================================= */

export async function countProperties(
  filters:
    PropertySearchParams
) {
  const db =
    await getBinShabibEstateNet();

  const normalizedSearch =
    normalizeSearch(
      filters.search
    );


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
        "BuildingId",
        sql.NVarChar(
          7
        ),
        filters.buildingId
          ?.trim() ||
          null
      )

      .input(
        "UnitDesc",
        sql.NVarChar(
          255
        ),
        filters.unitDesc
          ?.trim() ||
          null
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

      .query(`
        WITH EligibleUnits AS
        (
            SELECT
                U.build_id,

                LTRIM(
                    RTRIM(
                        U.Purpose_type
                    )
                )
                    AS purposeCode

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


                /* BUILDING */

                AND
                (
                    @BuildingId
                        IS NULL

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


                /* UNIT */

                AND
                (
                    @UnitDesc
                        IS NULL

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


                /* PROPERTY TYPE */

                AND
                (
                    @UnitTypeId
                        IS NULL

                    OR EXISTS
                    (
                        SELECT 1

                        FROM dbo.vw_UnitType
                            VUT

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


                /* BEDS */

                AND
                (
                    @Beds
                        IS NULL

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


                /* PRICE */

                AND
                (
                    @MinPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        >=
                    @MinPrice
                )

                AND
                (
                    @MaxPrice
                        IS NULL

                    OR
                    U.unit_annual_rent
                        <=
                    @MaxPrice
                )


                /* AREA */

                AND
                (
                    @MinArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        >=
                    @MinArea
                )

                AND
                (
                    @MaxArea
                        IS NULL

                    OR
                    U.unit_areasqft
                        <=
                    @MaxArea
                )
        )


        SELECT
            COUNT(*)
                AS total

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

                ON
                    A.area_id =
                    B.area_id


            LEFT JOIN dbo.place P

                ON
                    P.place_id =
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

                    OR
                    B.WebDisplayOrder
                        BETWEEN 1 AND 6
                )


                /* LOCATION */

                AND
                (
                    @Search
                        IS NULL

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
    result
      .recordset?.[0]
      ?.total ??
      0
  );
}


/* =========================================================
   GET ONE PROPERTY / BUILDING
========================================================= */

export async function findPropertyByBuildingId(
  buildingId:
    string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(
          7
        ),
        buildingId
      )

      .query(`
        SELECT
            LTRIM(
                RTRIM(
                    B.build_id
                )
            )
                AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            )
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
                    )
                    IS NOT NULL

                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                B.build_Add
                            )
                        )

                    ELSE
                        ''
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
                    )
                    IS NOT NULL

                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                A.area_desc
                            )
                        )

                    ELSE
                        ''
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
                    )
                    IS NOT NULL

                    THEN
                        ', ' +
                        LTRIM(
                            RTRIM(
                                P.place_desc
                            )
                        )

                    ELSE
                        ''
                END,

                1,
                2,
                ''
            )
                AS location,

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
            )
                AS webDisplayOrder

        FROM dbo.building B


        LEFT JOIN dbo.building_type
            BT

            ON
                BT.bldg_cat_id =
                B.bldg_cat_id


        LEFT JOIN dbo.area A

            ON
                A.area_id =
                B.area_id


        LEFT JOIN dbo.place P

            ON
                P.place_id =
                B.place_id


        WHERE
            LTRIM(
                RTRIM(
                    B.build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    @BuildingId
                )
            )

            AND ISNULL(
                B.IsActive,
                1
            ) = 1

            AND
            (
                B.WebDisplayOrder
                    IS NULL

                OR
                B.WebDisplayOrder
                    BETWEEN 1 AND 6
            );
      `);


  return (
    result
      .recordset[0] ||
    null
  );
}


/* =========================================================
   GET VACANT UNITS FOR BUILDING
========================================================= */

export async function findVacantUnitsByBuildingId(
  buildingId:
    string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(
          7
        ),
        buildingId
      )

      .query(`
        SELECT

            U.ucat_id
                AS referenceNo,

            U.unit_master_desc
                AS unitName,

            U.Purpose_type
                AS purposeCode,

            U.unitnature
                AS unitNature,

            UPT.Descr
                AS propertyType,

            U.unit_desc
                AS description,

            U.unit_floor_no
                AS floorNumber,

            U.unit_areasqft
                AS area,

            'Sq.Ft.'
                AS areaUnit,

            U.unit_annual_rent
                AS annualRent,

            U.unit_annual_rent_max
                AS maxAnnualRent,

            'AED'
                AS currency,

            U.Unit_NPayment
                AS numberOfPayments,

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

            U.unit_vacant
                AS vacant,

            U.IsActive
                AS isActive,

            U.imagepic
                AS image,

            U.sysdate
                AS lastUpdated


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


        LEFT JOIN dbo.Unit_Purpose_Type
            UPT

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
            LTRIM(
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

            AND
            (
                B.WebDisplayOrder
                    IS NULL

                OR
                B.WebDisplayOrder
                    BETWEEN 1 AND 6
            )


        ORDER BY

            CASE
                WHEN
                    U.Purpose_type =
                    'STD'
                THEN 1

                WHEN
                    U.Purpose_type =
                    '1BK'
                THEN 2

                WHEN
                    U.Purpose_type =
                    '2BK'
                THEN 3

                WHEN
                    U.Purpose_type =
                    '3BK'
                THEN 4

                WHEN
                    U.Purpose_type =
                    '4BK'
                THEN 5

                WHEN
                    U.Purpose_type =
                    'VIL'
                THEN 6

                WHEN
                    U.Purpose_type =
                    'OFF'
                THEN 7

                WHEN
                    U.Purpose_type =
                    'SHP'
                THEN 8

                WHEN
                    U.Purpose_type =
                    'SHW'
                THEN 9

                WHEN
                    U.Purpose_type =
                    'LBR'
                THEN 10

                WHEN
                    U.Purpose_type =
                    'WRH'
                THEN 11

                ELSE 99
            END,

            U.unit_floor_no,

            U.Unit_RefNo;
      `);


  return result.recordset;
}


/* =========================================================
   LEGACY PROPERTY FILTERS
========================================================= */

export async function getPropertyFilters() {
  const db =
    await getBinShabibEstateNet();

  const [
    propertyTypeResult,
    purposeResult,
    priceResult,
  ] =
    await Promise.all([
      db
        .request()
        .query(`
          SELECT DISTINCT
              unit_master_desc
                  AS value

          FROM dbo.unit

          WHERE
              ISNULL(
                  IsActive,
                  1
              ) = 1

              AND
              unit_master_desc
                  IS NOT NULL

              AND
              LTRIM(
                  RTRIM(
                      unit_master_desc
                  )
              ) <> ''

          ORDER BY
              value;
        `),

      db
        .request()
        .query(`
          SELECT DISTINCT
              Purpose_type
                  AS value

          FROM dbo.unit

          WHERE
              ISNULL(
                  IsActive,
                  1
              ) = 1

              AND
              Purpose_type
                  IS NOT NULL

              AND
              LTRIM(
                  RTRIM(
                      Purpose_type
                  )
              ) <> ''

          ORDER BY
              value;
        `),

      db
        .request()
        .query(`
          SELECT
              MIN(
                  unit_annual_rent
              )
                  AS minPrice,

              MAX(
                  unit_annual_rent
              )
                  AS maxPrice

          FROM dbo.unit

          WHERE
              ISNULL(
                  IsActive,
                  1
              ) = 1

              AND
              ISNULL(
                  unit_vacant,
                  'N'
              ) = 'Y'

              AND
              unit_annual_rent
                  IS NOT NULL;
        `),
    ]);


  return {
    propertyTypes:
      propertyTypeResult
        .recordset
        .map(
          (
            row
          ) =>
            row.value
        ),

    purposes:
      purposeResult
        .recordset
        .map(
          (
            row
          ) =>
            row.value
        ),

    priceRange: {
      min:
        Number(
          priceResult
            .recordset?.[0]
            ?.minPrice
        ) || 0,

      max:
        Number(
          priceResult
            .recordset?.[0]
            ?.maxPrice
        ) || 0,
    },
  };
}


/* =========================================================
   ADMIN ACTIVE PROPERTIES
========================================================= */

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
            )
                AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            )
                AS title,

            LTRIM(
                RTRIM(
                    P.place_desc
                )
            )
                AS placeName,

            LTRIM(
                RTRIM(
                    A.area_desc
                )
            )
                AS areaName,

            CAST(
                B.WebDisplayOrder
                AS INT
            )
                AS webDisplayOrder,

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
            )
                AS vacantUnits


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
                SELECT
                    1

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
                WHEN
                    B.WebDisplayOrder
                    BETWEEN 1 AND 6

                THEN 0

                WHEN
                    B.WebDisplayOrder
                    IS NULL

                THEN 1

                WHEN
                    B.WebDisplayOrder =
                    0

                THEN 2

                ELSE 3
            END,

            CASE
                WHEN
                    B.WebDisplayOrder
                    BETWEEN 1 AND 6

                THEN
                    B.WebDisplayOrder

                ELSE
                    999
            END,

            B.build_desc ASC;
      `);


  return result.recordset;
}


/* =========================================================
   UPDATE WEBSITE DISPLAY
========================================================= */

export async function updatePropertyWebDisplay(
  buildId:
    string,

  webDisplayOrder:
    number |
    null
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildId",
        sql.NVarChar(
          7
        ),
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
            LTRIM(
                RTRIM(
                    build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    @BuildId
                )
            );
      `);


  return (
    result
      .rowsAffected[0] ||
    0
  );
}


/* =========================================================
   IMAGE MANAGEMENT BUILDINGS
========================================================= */

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
            )
                AS id,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            )
                AS title,

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


        WHERE
            B.build_id
                IS NOT NULL

            AND
            LTRIM(
                RTRIM(
                    ISNULL(
                        B.build_desc,
                        ''
                    )
                )
            ) <> ''

            AND
            (
                /* NORMAL BUILDINGS */

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
                        SELECT
                            1

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

                /* UPCOMING */

                (
                    ISNULL(
                        B.IsUpcomingProject,
                        0
                    ) = 1
                )
            )


        ORDER BY

            CASE
                WHEN
                    ISNULL(
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


/* =========================================================
   BUILDING + UNIT FILTER OPTIONS
========================================================= */

interface BuildingOptionRow {
  buildingId:
    string;

  buildingName:
    string;
}

interface UnitOptionRow {
  unitDesc:
    string;

  purposeCode:
    string |
    null;

  unitType:
    string |
    null;

  annualRent:
    number |
    null;
}


export async function getPropertyBuildingUnitOptionsRepo(
  buildingId?:
    string
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(
          7
        ),
        buildingId
          ?.trim() ||
          null
      )

      .query(`
        /* =================================================
           BUILDINGS
        ================================================= */

        SELECT DISTINCT
            LTRIM(
                RTRIM(
                    B.build_id
                )
            )
                AS buildingId,

            LTRIM(
                RTRIM(
                    B.build_desc
                )
            )
                AS buildingName


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

                OR
                B.WebDisplayOrder
                    BETWEEN 1 AND 6
            )

            AND EXISTS
            (
                SELECT
                    1

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


        /* =================================================
           UNITS
        ================================================= */

        SELECT DISTINCT
            LTRIM(
                RTRIM(
                    U.unit_desc
                )
            )
                AS unitDesc,

            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            )
                AS purposeCode,

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


        LEFT JOIN dbo.Unit_Purpose_Type
            UPT

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
            @BuildingId
                IS NOT NULL

            AND
            LTRIM(
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




export async function getAvailablePropertyRangesRepo(
  unitTypeId?: number
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "UnitTypeId",
        sql.Int,
        unitTypeId ?? null
      )

      .query(`
        /* =================================================
           BUILD ELIGIBLE UNIT TEMP TABLE
        ================================================= */

        IF OBJECT_ID(
            'tempdb..#EligibleUnits'
        ) IS NOT NULL
        BEGIN
            DROP TABLE #EligibleUnits;
        END;


        SELECT
            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            ) AS Purpose_type,

            U.unit_areasqft,

            U.unit_annual_rent

        INTO #EligibleUnits

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

        WHERE
            ISNULL(
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
                B.WebDisplayOrder
                    IS NULL

                OR B.WebDisplayOrder
                    BETWEEN 1 AND 6
            )

            /* =============================================
               PROPERTY TYPE
            ============================================= */

            AND
            (
                @UnitTypeId IS NULL

                OR EXISTS
                (
                    SELECT
                        1

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
            );


        /* =================================================
           AREA RANGES
        ================================================= */

        SELECT
            value,

            label,

            sortOrder

        FROM
        (
            SELECT
                '0-500'
                    AS value,

                'Up to 500 Sq.Ft.'
                    AS label,

                1
                    AS sortOrder

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_areasqft >
                        0

                    AND unit_areasqft <=
                        500
            )


            UNION ALL


            SELECT
                '500-1000',

                '500 - 1,000 Sq.Ft.',

                2

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_areasqft >
                        500

                    AND unit_areasqft <=
                        1000
            )


            UNION ALL


            SELECT
                '1000-2000',

                '1,000 - 2,000 Sq.Ft.',

                3

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_areasqft >
                        1000

                    AND unit_areasqft <=
                        2000
            )


            UNION ALL


            SELECT
                '2000-5000',

                '2,000 - 5,000 Sq.Ft.',

                4

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_areasqft >
                        2000

                    AND unit_areasqft <=
                        5000
            )


            UNION ALL


            SELECT
                '5000-',

                '5,000+ Sq.Ft.',

                5

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_areasqft >
                        5000
            )
        ) AreaRanges

        ORDER BY
            sortOrder;


        /* =================================================
           PRICE RANGES
        ================================================= */

        SELECT
            value,

            label,

            sortOrder

        FROM
        (
            SELECT
                '0-30000'
                    AS value,

                'Up to AED 30K'
                    AS label,

                1
                    AS sortOrder

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_annual_rent >
                        0

                    AND unit_annual_rent <=
                        30000
            )


            UNION ALL


            SELECT
                '30000-50000',

                'AED 30K - 50K',

                2

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_annual_rent >
                        30000

                    AND unit_annual_rent <=
                        50000
            )


            UNION ALL


            SELECT
                '50000-100000',

                'AED 50K - 100K',

                3

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_annual_rent >
                        50000

                    AND unit_annual_rent <=
                        100000
            )


            UNION ALL


            SELECT
                '100000-200000',

                'AED 100K - 200K',

                4

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_annual_rent >
                        100000

                    AND unit_annual_rent <=
                        200000
            )


            UNION ALL


            SELECT
                '200000-',

                'AED 200K+',

                5

            WHERE EXISTS
            (
                SELECT
                    1

                FROM #EligibleUnits

                WHERE
                    unit_annual_rent >
                        200000
            )
        ) PriceRanges

        ORDER BY
            sortOrder;


        /* =================================================
           AVAILABLE BED TYPES
        ================================================= */

        SELECT
            value,

            label,

            sortOrder

        FROM
        (
            SELECT DISTINCT

                Purpose_type
                    AS value,

                CASE

                    WHEN Purpose_type =
                        'STD'
                    THEN
                        'Studio'

                    WHEN Purpose_type =
                        '1BK'
                    THEN
                        '1 BHK'

                    WHEN Purpose_type =
                        '2BK'
                    THEN
                        '2 BHK'

                    WHEN Purpose_type =
                        '3BK'
                    THEN
                        '3 BHK'

                    WHEN Purpose_type =
                        '4BK'
                    THEN
                        '4 BHK'

                    ELSE
                        Purpose_type

                END
                    AS label,

                CASE

                    WHEN Purpose_type =
                        'STD'
                    THEN 1

                    WHEN Purpose_type =
                        '1BK'
                    THEN 2

                    WHEN Purpose_type =
                        '2BK'
                    THEN 3

                    WHEN Purpose_type =
                        '3BK'
                    THEN 4

                    WHEN Purpose_type =
                        '4BK'
                    THEN 5

                    ELSE 99

                END
                    AS sortOrder

            FROM #EligibleUnits

            WHERE
                Purpose_type
                IN
                (
                    'STD',
                    '1BK',
                    '2BK',
                    '3BK',
                    '4BK'
                )

        ) BedRanges

        ORDER BY
            sortOrder;


        /* =================================================
           CLEAN TEMP TABLE
        ================================================= */

        DROP TABLE #EligibleUnits;
      `);


  const recordsets =
    result.recordsets as
      sql.IRecordSet<any>[];


  return {
    areaRanges:
      recordsets[0] ||
      [],

    priceRanges:
      recordsets[1] ||
      [],

    beds:
      recordsets[2] ||
      [],
  };



  
}


export interface DynamicFilterParams {
  search?: string;

  unitTypeId?: number;

  beds?: string;

  minArea?: number;

  maxArea?: number;

  minPrice?: number;

  maxPrice?: number;
}


export async function getDynamicPropertyFiltersRepo(
  filters: DynamicFilterParams
) {
  const db =
    await getBinShabibEstateNet();

  const result =
    await db
      .request()

      .input(
        "Search",
        sql.NVarChar(300),
        filters.search?.trim() ||
          null
      )

      .input(
        "UnitTypeId",
        sql.Int,
        filters.unitTypeId ??
          null
      )

      .input(
        "Beds",
        sql.NVarChar(20),
        filters.beds?.trim() ||
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

      .query(`
        /* =================================================
           ALL PUBLICLY AVAILABLE UNITS
        ================================================= */

        SELECT
            LTRIM(RTRIM(U.build_id))
                AS buildId,

            LTRIM(RTRIM(U.Purpose_type))
                AS purposeCode,

            U.unit_areasqft
                AS area,

            U.unit_annual_rent
                AS annualRent,

            LTRIM(RTRIM(B.build_Add))
                AS address,

            LTRIM(RTRIM(B.build_neigh))
                AS neighborhood,

            LTRIM(RTRIM(A.area_desc))
                AS areaName,

            LTRIM(RTRIM(P.place_desc))
                AS placeName

        INTO #BaseUnits

        FROM dbo.unit U

        INNER JOIN dbo.building B
            ON LTRIM(RTRIM(B.build_id))
             = LTRIM(RTRIM(U.build_id))

        LEFT JOIN dbo.area A
            ON A.area_id =
               B.area_id

        LEFT JOIN dbo.place P
            ON P.place_id =
               B.place_id

        WHERE
            ISNULL(U.IsActive, 1) = 1

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
                B.WebDisplayOrder
                    IS NULL

                OR B.WebDisplayOrder
                    BETWEEN 1 AND 6
            );


        /* =================================================
           PROPERTY TYPE OPTIONS

           Apply every filter EXCEPT property type.
        ================================================= */

        SELECT DISTINCT
            VUT.UnitTypeId
                AS value,

            VUT.UnitTypeDesc
                AS label

        FROM dbo.vw_UnitType VUT

        WHERE
            VUT.UnitTypeId <> 99

            AND EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    LTRIM(RTRIM(
                        BU.purposeCode
                    ))
                    =
                    LTRIM(RTRIM(
                        VUT.PurposeCode
                    ))

                    AND
                    (
                        @Beds IS NULL

                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL

                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL

                        OR BU.area <=
                           @MaxArea
                    )

                    AND
                    (
                        @MinPrice IS NULL

                        OR BU.annualRent >=
                           @MinPrice
                    )

                    AND
                    (
                        @MaxPrice IS NULL

                        OR BU.annualRent <=
                           @MaxPrice
                    )

                    AND
                    (
                        @Search IS NULL

                        OR BU.address
                           LIKE '%' +
                           @Search + '%'

                        OR BU.neighborhood
                           LIKE '%' +
                           @Search + '%'

                        OR BU.areaName
                           LIKE '%' +
                           @Search + '%'

                        OR BU.placeName
                           LIKE '%' +
                           @Search + '%'
                    )
            )

        ORDER BY
            label;


        /* =================================================
           BED OPTIONS

           Apply every filter EXCEPT Beds.
        ================================================= */

        SELECT
            purposeCode
                AS value,

            CASE
                WHEN purposeCode = 'STD'
                    THEN 'Studio'

                WHEN purposeCode = '1BK'
                    THEN '1 BHK'

                WHEN purposeCode = '2BK'
                    THEN '2 BHK'

                WHEN purposeCode = '3BK'
                    THEN '3 BHK'

                WHEN purposeCode = '4BK'
                    THEN '4 BHK'

                ELSE purposeCode
            END AS label,

            CASE
                WHEN purposeCode = 'STD'
                    THEN 1

                WHEN purposeCode = '1BK'
                    THEN 2

                WHEN purposeCode = '2BK'
                    THEN 3

                WHEN purposeCode = '3BK'
                    THEN 4

                WHEN purposeCode = '4BK'
                    THEN 5

                ELSE 99
            END AS sortOrder

        FROM
        (
            SELECT DISTINCT
                BU.purposeCode

            FROM #BaseUnits BU

            WHERE
                BU.purposeCode IN
                (
                    'STD',
                    '1BK',
                    '2BK',
                    '3BK',
                    '4BK'
                )

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

                            AND LTRIM(RTRIM(
                                VUT.PurposeCode
                            ))
                            =
                            LTRIM(RTRIM(
                                BU.purposeCode
                            ))
                    )
                )

                AND
                (
                    @MinArea IS NULL

                    OR BU.area >=
                       @MinArea
                )

                AND
                (
                    @MaxArea IS NULL

                    OR BU.area <=
                       @MaxArea
                )

                AND
                (
                    @MinPrice IS NULL

                    OR BU.annualRent >=
                       @MinPrice
                )

                AND
                (
                    @MaxPrice IS NULL

                    OR BU.annualRent <=
                       @MaxPrice
                )

                AND
                (
                    @Search IS NULL

                    OR BU.address
                       LIKE '%' +
                       @Search + '%'

                    OR BU.neighborhood
                       LIKE '%' +
                       @Search + '%'

                    OR BU.areaName
                       LIKE '%' +
                       @Search + '%'

                    OR BU.placeName
                       LIKE '%' +
                       @Search + '%'
                )

        ) X

        ORDER BY
            sortOrder;


        /* =================================================
           AREA RANGES

           Apply everything EXCEPT area.
        ================================================= */

        SELECT
            value,
            label,
            sortOrder

        FROM
        (
            SELECT
                '0-500'
                    AS value,

                'Up to 500 Sq.Ft.'
                    AS label,

                1 AS sortOrder

            WHERE EXISTS
            (
                SELECT 1
                FROM #BaseUnits BU

                WHERE
                    BU.area > 0
                    AND BU.area <= 500

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )

                    AND
                    (
                        @MinPrice IS NULL
                        OR BU.annualRent >=
                           @MinPrice
                    )

                    AND
                    (
                        @MaxPrice IS NULL
                        OR BU.annualRent <=
                           @MaxPrice
                    )
            )


            UNION ALL


            SELECT
                '500-1000',
                '500 - 1,000 Sq.Ft.',
                2

            WHERE EXISTS
            (
                SELECT 1
                FROM #BaseUnits BU

                WHERE
                    BU.area > 500
                    AND BU.area <= 1000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )

                    AND
                    (
                        @MinPrice IS NULL
                        OR BU.annualRent >=
                           @MinPrice
                    )

                    AND
                    (
                        @MaxPrice IS NULL
                        OR BU.annualRent <=
                           @MaxPrice
                    )
            )


            UNION ALL


            SELECT
                '1000-2000',
                '1,000 - 2,000 Sq.Ft.',
                3

            WHERE EXISTS
            (
                SELECT 1
                FROM #BaseUnits BU

                WHERE
                    BU.area > 1000
                    AND BU.area <= 2000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '2000-5000',
                '2,000 - 5,000 Sq.Ft.',
                4

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.area > 2000
                    AND BU.area <= 5000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '5000-',
                '5,000+ Sq.Ft.',
                5

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.area > 5000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )

        ) AreaOptions

        ORDER BY
            sortOrder;


        /* =================================================
           PRICE RANGES

           Apply everything EXCEPT Price.
        ================================================= */

        SELECT
            value,
            label,
            sortOrder

        FROM
        (
            SELECT
                '0-30000'
                    AS value,

                'Up to AED 30K'
                    AS label,

                1 AS sortOrder

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.annualRent > 0
                    AND BU.annualRent <=
                        30000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL
                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL
                        OR BU.area <=
                           @MaxArea
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '30000-50000',
                'AED 30K - 50K',
                2

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.annualRent > 30000
                    AND BU.annualRent <=
                        50000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL
                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL
                        OR BU.area <=
                           @MaxArea
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '50000-100000',
                'AED 50K - 100K',
                3

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.annualRent > 50000
                    AND BU.annualRent <=
                        100000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL
                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL
                        OR BU.area <=
                           @MaxArea
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '100000-200000',
                'AED 100K - 200K',
                4

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.annualRent > 100000
                    AND BU.annualRent <=
                        200000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL
                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL
                        OR BU.area <=
                           @MaxArea
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )


            UNION ALL


            SELECT
                '200000-',
                'AED 200K+',
                5

            WHERE EXISTS
            (
                SELECT 1

                FROM #BaseUnits BU

                WHERE
                    BU.annualRent >
                        200000

                    AND
                    (
                        @Beds IS NULL
                        OR BU.purposeCode =
                           @Beds
                    )

                    AND
                    (
                        @MinArea IS NULL
                        OR BU.area >=
                           @MinArea
                    )

                    AND
                    (
                        @MaxArea IS NULL
                        OR BU.area <=
                           @MaxArea
                    )

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

                                AND LTRIM(RTRIM(
                                    VUT.PurposeCode
                                ))
                                =
                                LTRIM(RTRIM(
                                    BU.purposeCode
                                ))
                        )
                    )
            )

        ) PriceOptions

        ORDER BY
            sortOrder;


        DROP TABLE #BaseUnits;
      `);

  const sets =
    result.recordsets as
      sql.IRecordSet<any>[];

  return {
    propertyTypes:
      sets[0] || [],

    beds:
      sets[1] || [],

    areaRanges:
      sets[2] || [],

    priceRanges:
      sets[3] || [],
  };
}
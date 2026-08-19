import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export interface PropertySearchParams {
  search?: string;

  unitTypeId?: number;

  beds?: string;

  minPrice?: number;

  maxPrice?: number;

  page?: number;

  pageSize?: number;
}

export async function findAllProperties(
  filters: PropertySearchParams
) {
  const db = await getBinShabibEstateNet();

  const page =
    Number.isInteger(filters.page) &&
    Number(filters.page) > 0
      ? Number(filters.page)
      : 1;

  const requestedPageSize =
    Number.isInteger(filters.pageSize) &&
    Number(filters.pageSize) > 0
      ? Number(filters.pageSize)
      : 20;

  const pageSize = Math.min(
    requestedPageSize,
    100
  );

  const offset =
    (page - 1) * pageSize;

  const request = db
    .request()

    .input(
      "Search",
      sql.NVarChar(300),
      filters.search || null
    )

    .input(
      "UnitTypeId",
      sql.Int,
      filters.unitTypeId ?? null
    )

    .input(
      "Beds",
      sql.NVarChar(10),
      filters.beds || null
    )

    .input(
      "MinPrice",
      sql.Decimal(18, 2),
      filters.minPrice ?? null
    )

    .input(
      "MaxPrice",
      sql.Decimal(18, 2),
      filters.maxPrice ?? null
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
    );

  const result = await request.query(`
    /*
    ==========================================================
    ELIGIBLE UNITS

    1. Active unit
    2. Vacant unit
    3. Match Property Type from UnitType.PurposeCodes
    4. Match Beds when specifically selected
    5. Match rent range
    ==========================================================
    */

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


            /*
            ============================================
            PROPERTY TYPE

            Example:

            APARTMENT
            PurposeCodes =
            STD,1BK,2BK,3BK,4BK

            U.Purpose_type must exist
            inside those codes.
            ============================================
            */

            AND
(
    @UnitTypeId IS NULL

    OR EXISTS
    (
        SELECT 1
        FROM dbo.UnitType UT

        WHERE
            UT.UnitTypeId = @UnitTypeId

            AND ISNULL(
                UT.IsActive,
                1
            ) = 1

            AND
            ',' +
            REPLACE(
                ISNULL(
                    UT.PurposeCodes,
                    ''
                ),
                ' ',
                ''
            ) +
            ','
            LIKE
            '%,' +
            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            ) +
            ',%'
    )
)


            /*
            ============================================
            BEDS

            Frontend sends:

            Studio -> STD
            1 Bed   -> 1BK
            2 Bed   -> 2BK
            3 Bed   -> 3BK
            4 Bed   -> 4BK

            Exact ERP code comparison.
            ============================================
            */

            AND
            (
                @Beds IS NULL

                OR U.Purpose_type =
                   @Beds
            )


            /*
            ============================================
            MINIMUM PRICE
            ============================================
            */

            AND
            (
                @MinPrice IS NULL

                OR U.unit_annual_rent >=
                   @MinPrice
            )


            /*
            ============================================
            MAXIMUM PRICE
            ============================================
            */

            AND
            (
                @MaxPrice IS NULL

                OR U.unit_annual_rent <=
                   @MaxPrice
            )
    ),




    BuildingPropertyTypes AS
    (
        SELECT
            X.build_id,

            STRING_AGG(
                X.UnitTypeName,
                ', '
            ) AS availableTypes

        FROM
        (
            SELECT DISTINCT
                EU.build_id,

                UPT.Descr
                    AS UnitTypeName

            FROM EligibleUnits EU

            LEFT JOIN dbo.Unit_Purpose_Type UPT
                ON UPT.Code =
                   EU.Purpose_type

            WHERE
                UPT.Descr IS NOT NULL

                AND LTRIM(
                    RTRIM(
                        UPT.Descr
                    )
                ) <> ''
        ) X

        GROUP BY
            X.build_id
    )


    SELECT

        ------------------------------------------------
        -- BUILDING
        ------------------------------------------------

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


        ------------------------------------------------
        -- LOCATION
        ------------------------------------------------

        CONCAT_WS(
            ', ',

            NULLIF(
                LTRIM(
                    RTRIM(
                        B.build_Add
                    )
                ),
                ''
            ),

            NULLIF(
                LTRIM(
                    RTRIM(
                        A.area_desc
                    )
                ),
                ''
            ),

            NULLIF(
                LTRIM(
                    RTRIM(
                        P.place_desc
                    )
                ),
                ''
            )
        ) AS location,


        ------------------------------------------------
        -- BUILDING DETAILS
        ------------------------------------------------

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


        ------------------------------------------------
        -- WEBSITE PRIORITY
        ------------------------------------------------

        ISNULL(
            WBC.IsTopPriority,
            0
        ) AS isTopPriority,

        WBC.PriorityOrder
            AS priorityOrder,


        ------------------------------------------------
        -- AVAILABLE TYPES
        ------------------------------------------------

        BPT.availableTypes,


        /*
        If only one Purpose_type remains,
        return its description.
        */

        CASE

            WHEN COUNT(
                DISTINCT
                U.Purpose_type
            ) = 1

            THEN MAX(
                UPT.Descr
            )

            ELSE 'Multiple Types'

        END AS propertyType,


        ------------------------------------------------
        -- VACANCY
        ------------------------------------------------

        COUNT_BIG(*)
            AS vacantUnits,


        ------------------------------------------------
        -- PRICE
        ------------------------------------------------

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


        ------------------------------------------------
        -- AREA
        ------------------------------------------------

        MIN(
            U.unit_areasqft
        ) AS area,

        MAX(
            U.unit_areasqft
        ) AS maxArea,

        'Sq.Ft.'
            AS areaUnit,


        ------------------------------------------------
        -- WEBSITE PURPOSE
        ------------------------------------------------

        'Rent'
            AS purpose,


        ------------------------------------------------
        -- OTHER UNIT SUMMARY
        ------------------------------------------------

        MIN(
            U.Unit_RefNo
        ) AS referenceNo,

        MAX(
            U.Unit_NPayment
        ) AS numberOfPayments,

        MAX(
            U.sysdate
        ) AS lastUpdated


    FROM EligibleUnits U


    INNER JOIN dbo.building B
        ON B.build_id =
           U.build_id


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
        ON UPT.Code =
           U.Purpose_type


    LEFT JOIN BuildingPropertyTypes BPT
        ON BPT.build_id =
           B.build_id


    LEFT JOIN dbo.BuildingOrderConfig WBC
        ON WBC.build_id =
           B.build_id


    WHERE
        ISNULL(
            B.IsActive,
            1
        ) = 1


        /*
        ================================================
        LOCATION SEARCH ONLY
        ================================================
        */

        AND
        (
            @Search IS NULL

            OR B.build_Add
               LIKE
               '%' +
               @Search +
               '%'

            OR B.build_neigh
               LIKE
               '%' +
               @Search +
               '%'

            OR A.area_desc
               LIKE
               '%' +
               @Search +
               '%'

            OR P.place_desc
               LIKE
               '%' +
               @Search +
               '%'
        )


    /*
    ====================================================
    ONE ROW PER BUILDING
    ====================================================
    */

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

        BPT.availableTypes,

        WBC.IsTopPriority,

        WBC.PriorityOrder


    /*
    ====================================================
    PRIORITY BUILDINGS FIRST
    ====================================================
    */

    ORDER BY

        ISNULL(
            WBC.IsTopPriority,
            0
        ) DESC,

        CASE

            WHEN ISNULL(
                WBC.IsTopPriority,
                0
            ) = 1

            THEN ISNULL(
                WBC.PriorityOrder,
                999999
            )

            ELSE 999999

        END ASC,

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

        UT.UnitTypeId AS unitTypeId,
        UT.UnitTypeDesc AS unitTypeName

    FROM dbo.uCategory UC

    LEFT JOIN dbo.UnitType UT
        ON UT.ucat_id = UC.ucat_id
        AND ISNULL(UT.IsActive, 1) = 1

    ORDER BY
        CASE
            WHEN UC.ucat_Desc = 'RESIDENTIAL' THEN 1
            WHEN UC.ucat_Desc = 'COMMERCIAL' THEN 2
            ELSE 3
        END,
        UT.UnitTypeDesc;
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
  const db = await getBinShabibEstateNet();

  const result = await db
    .request()

    .input(
      "Search",
      sql.NVarChar(300),
      filters.search || null
    )

    .input(
      "UnitTypeId",
      sql.Int,
      filters.unitTypeId ?? null
    )

    .input(
      "Beds",
      sql.NVarChar(10),
      filters.beds || null
    )

    .input(
      "MinPrice",
      sql.Decimal(18, 2),
      filters.minPrice ?? null
    )

    .input(
      "MaxPrice",
      sql.Decimal(18, 2),
      filters.maxPrice ?? null
    )

    .query(`
      SELECT
          COUNT(
              DISTINCT B.build_id
          ) AS total

      FROM dbo.unit U

      INNER JOIN dbo.building B
          ON B.build_id =
             U.build_id

      LEFT JOIN dbo.area A
          ON A.area_id =
             B.area_id

      LEFT JOIN dbo.place P
          ON P.place_id =
             B.place_id

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


          /*
          PROPERTY TYPE
          */

         AND
(
    @UnitTypeId IS NULL

    OR EXISTS
    (
        SELECT 1
        FROM dbo.UnitType UT

        WHERE
            UT.UnitTypeId = @UnitTypeId

            AND ISNULL(
                UT.IsActive,
                1
            ) = 1

            AND
            ',' +
            REPLACE(
                ISNULL(
                    UT.PurposeCodes,
                    ''
                ),
                ' ',
                ''
            ) +
            ','
            LIKE
            '%,' +
            LTRIM(
                RTRIM(
                    U.Purpose_type
                )
            ) +
            ',%'
    )
)


          /*
          BEDS
          */

          AND
          (
              @Beds IS NULL

              OR U.Purpose_type =
                 @Beds
          )


          /*
          MIN PRICE
          */

          AND
          (
              @MinPrice IS NULL

              OR U.unit_annual_rent >=
                 @MinPrice
          )


          /*
          MAX PRICE
          */

          AND
          (
              @MaxPrice IS NULL

              OR U.unit_annual_rent <=
                 @MaxPrice
          )


          /*
          LOCATION
          */

          AND
          (
              @Search IS NULL

              OR B.build_Add
                 LIKE
                 '%' +
                 @Search +
                 '%'

              OR B.build_neigh
                 LIKE
                 '%' +
                 @Search +
                 '%'

              OR A.area_desc
                 LIKE
                 '%' +
                 @Search +
                 '%'

              OR P.place_desc
                 LIKE
                 '%' +
                 @Search +
                 '%'
          );
    `);

  return Number(
    result.recordset?.[0]?.total ||
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

            CONCAT_WS(
                ', ',

                NULLIF(
                    LTRIM(
                        RTRIM(
                            B.build_Add
                        )
                    ),
                    ''
                ),

                NULLIF(
                    LTRIM(
                        RTRIM(
                            A.area_desc
                        )
                    ),
                    ''
                ),

                NULLIF(
                    LTRIM(
                        RTRIM(
                            P.place_desc
                        )
                    ),
                    ''
                )
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
                AS isVilla

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
            ) = 1;
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
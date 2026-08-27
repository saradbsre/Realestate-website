import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";
import sql from "mssql";

export async function findNationalities() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(RTRIM(nation_id))
                AS id,

            LTRIM(RTRIM(nation_nationality))
                AS nationality,

            LTRIM(RTRIM(nation_country))
                AS country

        FROM dbo.nation

        WHERE
            nation_nationality IS NOT NULL
            AND LTRIM(
                RTRIM(
                    nation_nationality
                )
            ) <> ''

        ORDER BY
            nation_nationality ASC;
      `);

  return result.recordset;
}
export async function findAutoRejectNationalities() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(RTRIM(nation_id)) AS id,
            LTRIM(RTRIM(nation_nationality)) AS nationality,
            LTRIM(RTRIM(nation_country)) AS country,
            CAST(
              ISNULL(iswebBK_autoReject, 0)
              AS BIT
            ) AS isAutoReject
        FROM dbo.nation
        WHERE
            ISNULL(iswebBK_autoReject, 0) = 1
            AND nation_nationality IS NOT NULL
            AND LTRIM(RTRIM(nation_nationality)) <> ''
        ORDER BY
            nation_nationality ASC;
      `);

  return result.recordset;
}

/* =========================================================
   AVAILABLE NATIONALITIES FOR DROPDOWN
========================================================= */

export async function findAvailableNationalities() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .query(`
        SELECT
            LTRIM(RTRIM(nation_id)) AS id,
            LTRIM(RTRIM(nation_nationality)) AS nationality,
            LTRIM(RTRIM(nation_country)) AS country
        FROM dbo.nation
        WHERE
            ISNULL(iswebBK_autoReject, 0) = 0
            AND nation_nationality IS NOT NULL
            AND LTRIM(RTRIM(nation_nationality)) <> ''
        ORDER BY
            nation_nationality ASC;
      `);

  return result.recordset;
}

/* =========================================================
   ENABLE AUTO REJECT
========================================================= */

export async function enableNationalityAutoReject(
  nationId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .input(
        "NationId",
        sql.NVarChar(7),
        nationId
      )
      .query(`
        UPDATE dbo.nation
        SET
            iswebBK_autoReject = 1
        WHERE
            LTRIM(RTRIM(nation_id))
              = LTRIM(RTRIM(@NationId))
            AND ISNULL(
              iswebBK_autoReject,
              0
            ) = 0;
      `);

  return (
    result.rowsAffected[0] ||
    0
  );
}
/* =========================================================
   REMOVE AUTO REJECT
========================================================= */

export async function disableNationalityAutoReject(
  nationId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()
      .input(
        "NationId",
        sql.NVarChar(7),
        nationId
      )
      .query(`
        UPDATE dbo.nation
        SET
            iswebBK_autoReject = 0
        WHERE
            LTRIM(RTRIM(nation_id))
              = LTRIM(RTRIM(@NationId))
            AND ISNULL(
              iswebBK_autoReject,
              0
            ) = 1;
      `);

  return (
    result.rowsAffected[0] ||
    0
  );
}

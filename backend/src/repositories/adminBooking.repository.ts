import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";

/* =========================================================
   GET ALL WEB BOOKINGS
========================================================= */

export async function findAllWebRequests(
  requestType:
    | "BOOKING"
    | "ENQUIRY"
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "RequestType",
        sql.NVarChar(20),
        requestType
      )

      .query(`
        SELECT
            WB.BookingId AS id,

            WB.buildingId AS propertyId,
            WB.buildingName AS propertyName,

            WB.UnitReference AS unitReference,
            WB.UnitType AS unitType,

            WB.CustomerName AS name,
            WB.Email AS email,
            WB.Phone AS phone,

            WB.NationId AS nationId,

            LTRIM(
                RTRIM(
                    N.nation_nationality
                )
            ) AS nationality,

            WB.PassportFileName
                AS passportFileName,

            WB.PassportMimeType
                AS passportMimeType,

            WB.PassportFileSize
                AS passportFileSize,

            CASE
                WHEN WB.PassportFile
                    IS NOT NULL
                THEN CAST(
                    1 AS BIT
                )

                ELSE CAST(
                    0 AS BIT
                )
            END
                AS hasPassport,

            WB.Status
                AS status,

            ISNULL(
                WB.IsAutoRejected,
                0
            )
                AS isAutoRejected,

            WB.DeclineReason
                AS declineReason,

            WB.RequestType
                AS requestType,

            WB.CreatedAt
                AS createdAt,

            WB.UpdatedAt
                AS updatedAt

        FROM dbo.WebBookings WB

        LEFT JOIN dbo.nation N
            ON LTRIM(
                RTRIM(
                    N.nation_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    WB.NationId
                )
            )

        WHERE
            UPPER(
                LTRIM(
                    RTRIM(
                        WB.RequestType
                    )
                )
            )
            =
            @RequestType

        ORDER BY
            WB.CreatedAt DESC,
            WB.BookingId DESC;
      `);

  return result.recordset;
}
/* =========================================================
   GET ONE BOOKING
========================================================= */

export async function findWebBookingById(
  bookingId: number
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BookingId",
        sql.Int,
        bookingId
      )

      .query(`
        SELECT TOP (1)
            WB.BookingId AS id,

            WB.buildingId AS propertyId,

            WB.buildingName AS propertyName,

            WB.UnitReference AS unitReference,

            WB.UnitType AS unitType,

            WB.CustomerName AS name,

            WB.Email AS email,

            WB.Phone AS phone,

            WB.NationId AS nationId,

            LTRIM(
                RTRIM(
                    N.nation_nationality
                )
            ) AS nationality,

            WB.PassportFileName
                AS passportFileName,

            WB.PassportMimeType
                AS passportMimeType,

            WB.PassportFileSize
                AS passportFileSize,

            CASE
                WHEN WB.PassportFile IS NOT NULL
                THEN CAST(1 AS BIT)
                ELSE CAST(0 AS BIT)
            END AS hasPassport,

            WB.Status AS status,

            ISNULL(
                WB.IsAutoRejected,
                0
            ) AS isAutoRejected,

            WB.DeclineReason
                AS declineReason,
                    WB.RequestType
    AS requestType,


            WB.CreatedAt AS createdAt,

            WB.UpdatedAt AS updatedAt
        
        FROM dbo.WebBookings WB

        LEFT JOIN dbo.nation N
            ON LTRIM(RTRIM(N.nation_id))
             =
               LTRIM(RTRIM(WB.NationId))

        WHERE
            WB.BookingId =
                @BookingId

            AND WB.RequestType =
                  @BookingId;

                  
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/* =========================================================
   GET PASSPORT BINARY
========================================================= */

export async function findBookingPassport(
  bookingId: number
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BookingId",
        sql.Int,
        bookingId
      )

      .query(`
        SELECT TOP 1
            PassportFile,
            PassportFileName,
            PassportMimeType

        FROM dbo.WebBookings

        WHERE
            BookingId =
            @BookingId;
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/* =========================================================
   UPDATE STATUS
========================================================= */

export async function updateWebBookingStatus(
  bookingId: number,
  status:
    | "Confirmed"
    | "Declined",
  reason:
    string | null
) {
  const pool =
    await getBinShabibEstateNet();

  await pool
    .request()

    .input(
      "BookingId",
      sql.Int,
      bookingId
    )

    .input(
      "Status",
      sql.NVarChar(30),
      status
    )

    .input(
      "DeclineReason",
      sql.NVarChar(500),
      reason
    )

    .query(`
      UPDATE dbo.WebBookings

      SET
          Status =
              @Status,

          DeclineReason =
              @DeclineReason,

          UpdatedAt =
              GETDATE()

      WHERE
          BookingId =
              @BookingId;
    `);
}
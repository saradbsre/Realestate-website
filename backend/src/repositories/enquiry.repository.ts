import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";

export interface CreateEnquiryData {
  customerName: string;
  email: string;
  phone: string;
  nationId: string;
  inquiryDepartment: string | null;
  message: string;
}

/* =========================================================
   CHECK NATIONALITY AUTO-REJECTION
========================================================= */

export async function findEnquiryNationalityRule(
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
        SELECT TOP (1)
            LTRIM(RTRIM(nation_id))
                AS id,

            LTRIM(RTRIM(nation_nationality))
                AS nationality,

            CAST(
                ISNULL(
                    iswebBK_autoReject,
                    0
                )
                AS BIT
            ) AS isAutoReject

        FROM dbo.nation

        WHERE
            LTRIM(RTRIM(nation_id))
              =
            LTRIM(RTRIM(@NationId));
      `);

  return (
    result.recordset[0] ||
    null
  );
}

/* =========================================================
   CREATE WEB ENQUIRY
========================================================= */

export async function createWebEnquiry(
  data: CreateEnquiryData,
  isAutoRejected: boolean
) {
  const pool =
    await getBinShabibEstateNet();

  const status =
    isAutoRejected
      ? "Declined"
      : "Pending";

  const declineReason =
    isAutoRejected
      ? "Automatically declined by configured nationality rules."
      : null;

  const result =
    await pool
      .request()

      .input(
        "CustomerName",
        sql.NVarChar(150),
        data.customerName
      )

      .input(
        "Email",
        sql.NVarChar(254),
        data.email
      )

      .input(
        "Phone",
        sql.NVarChar(50),
        data.phone
      )

      .input(
  "NationId",
  sql.NVarChar(7),
  data.nationId
)

      .input(
        "InquiryDepartment",
        sql.NVarChar(150),
        data.inquiryDepartment
      )

      .input(
        "EnquiryMessage",
        sql.NVarChar(sql.MAX),
        data.message
      )

      .input(
        "Status",
        sql.NVarChar(30),
        status
      )

      .input(
        "IsAutoRejected",
        sql.Bit,
        isAutoRejected
          ? 1
          : 0
      )

      .input(
        "DeclineReason",
        sql.NVarChar(500),
        declineReason
      )

      .input(
        "RequestType",
        sql.NVarChar(20),
        "ENQUIRY"
      )

      .query(`
        INSERT INTO dbo.WebBookings
        (
             buildingId,
    buildingName,

            customerName,
            email,
            phone,
            nationId,

            passportFile,
            passportFileName,
            passportMimeType,
            passportFileSize,

            status,
            isAutoRejected,
            declineReason,

            createdAt,
            updatedAt,
            createdBy,

            unitReference,
            unitType,

            requestType,
            inquiryDepartment,
            enquiryMessage
        )
        VALUES
        (
            NULL,
            NULL,

            @CustomerName,
            @Email,
            @Phone,
           @NationId,

            NULL,
            NULL,
            NULL,
            NULL,

            @Status,
            @IsAutoRejected,
            @DeclineReason,

            GETDATE(),
            NULL,
            'WEBSITE',

            NULL,
            NULL,

            @RequestType,
            @InquiryDepartment,
            @EnquiryMessage
        );

        SELECT
            CAST(
                SCOPE_IDENTITY()
                AS INT
            ) AS id;
      `);

  return result.recordset[0];
}

import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";

export interface CreateBookingInput {
  propertyId: string;

  propertyName: string;

  customerName: string;
  unitReference?: string | null;
  unitType?: string | null

  email: string;

  phone: string;

  nationality: string;

  passportFile: Buffer;

  passportFileName: string;

  passportMimeType: string;

  passportFileSize: number;

  status: string;

  isAutoRejected: boolean;

  declineReason:
    | string
    | null;
}

export interface CreatedBooking {
  BookingId: number;

  PropertyId: string;

  PropertyName: string;

  CustomerName: string;

  Email: string;

  Phone: string;

  Nationality: string;

  Status: string;

  IsAutoRejected: boolean;

  CreatedAt: Date;
}

/*
|--------------------------------------------------------------------------
| Insert booking
|--------------------------------------------------------------------------
*/

export async function createBooking(
  booking: CreateBookingInput
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "PropertyId",
        sql.NVarChar(20),
        booking.propertyId
      )

      .input(
        "PropertyName",
        sql.NVarChar(300),
        booking.propertyName
      )

      .input(
        "UnitReference",
        sql.NVarChar(100),
        booking.unitReference
      )

      .input(
        "UnitType",
        sql.NVarChar(150),
        booking.unitType
      )

      .input(
        "CustomerName",
        sql.NVarChar(150),
        booking.customerName
      )

      .input(
        "Email",
        sql.NVarChar(254),
        booking.email
      )

      .input(
        "Phone",
        sql.NVarChar(50),
        booking.phone
      )

      .input(
        "Nationality",
        sql.NVarChar(100),
        booking.nationality
      )

      .input(
        "PassportFile",
        sql.VarBinary(sql.MAX),
        booking.passportFile
      )

      .input(
        "PassportFileName",
        sql.NVarChar(255),
        booking.passportFileName
      )

      .input(
        "PassportMimeType",
        sql.NVarChar(100),
        booking.passportMimeType
      )

      .input(
        "PassportFileSize",
        sql.Int,
        booking.passportFileSize
      )

      .input(
        "Status",
        sql.NVarChar(30),
        booking.status
      )

      .input(
        "IsAutoRejected",
        sql.Bit,
        booking.isAutoRejected
      )

      .input(
        "DeclineReason",
        sql.NVarChar(500),
        booking.declineReason
      )

      .query(`
        INSERT INTO dbo.WebBookings
        (
            PropertyId,
            PropertyName,

            UnitReference,
            UnitType,

            CustomerName,
            Email,
            Phone,
            Nationality,

            PassportFile,
            PassportFileName,
            PassportMimeType,
            PassportFileSize,

            Status,
            IsAutoRejected,
            DeclineReason,

            CreatedBy
        )
        OUTPUT
            INSERTED.BookingId,
            INSERTED.PropertyId,
            INSERTED.PropertyName,
            INSERTED.UnitReference,
            INSERTED.UnitType,
            INSERTED.Status,
            INSERTED.CreatedAt
        VALUES
        (
            @PropertyId,
            @PropertyName,

            @UnitReference,
            @UnitType,

            @CustomerName,
            @Email,
            @Phone,
            @Nationality,

            @PassportFile,
            @PassportFileName,
            @PassportMimeType,
            @PassportFileSize,

            @Status,
            @IsAutoRejected,
            @DeclineReason,

            'WEBSITE'
        );
      `);

  return result.recordset[0];
}
export async function findBookingProperty(
  propertyId: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "PropertyId",
        sql.NVarChar(20),
        propertyId
      )

      .query(`
        SELECT TOP 1
            LTRIM(RTRIM(B.build_id))
                AS propertyId,

            LTRIM(RTRIM(B.build_desc))
                AS propertyName

        FROM dbo.building B

        WHERE
            LTRIM(RTRIM(B.build_id))
                = LTRIM(RTRIM(@PropertyId))

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

export async function findBookingUnit(
  propertyId: string,
  unitReference: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "PropertyId",
        sql.NVarChar(20),
        propertyId
      )

      .input(
        "UnitReference",
        sql.NVarChar(100),
        unitReference
      )

      .query(`
        SELECT TOP 1
            LTRIM(RTRIM(U.build_id))
                AS propertyId,

            LTRIM(RTRIM(U.ucat_id))
                AS unitReference,

            LTRIM(RTRIM(UPT.Descr))
                AS unitType,

            LTRIM(RTRIM(U.Purpose_type))
                AS purposeCode,

            ISNULL(
              U.unit_annual_rent,
              0
            ) AS annualRent

        FROM dbo.unit U

        LEFT JOIN dbo.Unit_Purpose_Type UPT
          ON LTRIM(RTRIM(UPT.Code))
           = LTRIM(RTRIM(U.Purpose_type))

        WHERE
            LTRIM(RTRIM(U.build_id))
              = LTRIM(RTRIM(@PropertyId))

            AND LTRIM(RTRIM(U.ucat_id))
              = LTRIM(RTRIM(@UnitReference))

            AND ISNULL(
                U.IsActive,
                1
            ) = 1

            AND ISNULL(
                U.unit_vacant,
                'N'
            ) = 'Y';
      `);

  return result.recordset[0] || null;
}
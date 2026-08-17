import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export interface NewBooking {
  propertyId: number; propertyName: string; name: string; email: string;
  phone: string; nationality: string; passportPath: string;
}

export async function hasActiveNationalityRejection(nationality: string) {
  const connection = await getBinShabibEstateNet();
  const result = await connection.request().input("nationality", sql.NVarChar(100), nationality)
    .query("SELECT TOP 1 id FROM dbo.NationalityAutoRejections WHERE LOWER(nationality)=LOWER(@nationality) AND isActive=1");
  return result.recordset.length > 0;
}

export async function insertBooking(booking: NewBooking, autoRejected: boolean) {
  const connection = await getBinShabibEstateNet();
  const result = await connection.request()
    .input("propertyId", sql.Int, booking.propertyId).input("propertyName", sql.NVarChar(255), booking.propertyName)
    .input("name", sql.NVarChar(150), booking.name).input("email", sql.NVarChar(255), booking.email)
    .input("phone", sql.NVarChar(50), booking.phone).input("nationality", sql.NVarChar(100), booking.nationality)
    .input("passportPath", sql.NVarChar(sql.MAX), booking.passportPath)
    .input("status", sql.NVarChar(30), autoRejected ? "Declined" : "Pending")
    .input("reason", sql.NVarChar(500), autoRejected ? "The requested unit was reserved very recently and is no longer available." : null)
    .query("INSERT dbo.Bookings(propertyId,propertyName,name,email,phone,nationality,passportPath,status,declineReason) OUTPUT INSERTED.id,INSERTED.status VALUES(@propertyId,@propertyName,@name,@email,@phone,@nationality,@passportPath,@status,@reason)");
  return result.recordset[0];
}

export async function findAllBookings() {
  return (await (await getBinShabibEstateNet()).request().query("SELECT * FROM dbo.Bookings ORDER BY createdAt DESC")).recordset;
}

export async function updateBookingStatus(id: number, status: string) {
  const result = await (await getBinShabibEstateNet()).request().input("id", sql.Int, id).input("status", sql.NVarChar(30), status)
    .query("UPDATE dbo.Bookings SET status=@status,updatedAt=SYSDATETIME() OUTPUT INSERTED.* WHERE id=@id");
  return result.recordset[0] ?? null;
}

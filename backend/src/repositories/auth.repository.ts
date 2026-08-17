import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export async function findUserByUsername(username: string) {
  const result = await (await getBinShabibEstateNet()).request().input("username", sql.NVarChar(100), username)
    .query("SELECT TOP 1 * FROM dbo.Users WHERE username=@username");
  return result.recordset[0] ?? null;
}

export async function saveEmailOtp(userId: number, code: string) {
  await (await getBinShabibEstateNet()).request().input("id", sql.Int, userId).input("code", sql.VarChar(6), code)
    .query("UPDATE dbo.Users SET otpCode=@code,otpExpiry=DATEADD(minute,10,SYSDATETIME()),updatedAt=SYSDATETIME() WHERE id=@id");
}

export async function clearOtp(userId: number) {
  await (await getBinShabibEstateNet()).request().input("id", sql.Int, userId)
    .query("UPDATE dbo.Users SET otpCode=NULL,otpExpiry=NULL WHERE id=@id");
}

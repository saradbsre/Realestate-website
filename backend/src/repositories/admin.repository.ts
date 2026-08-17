import crypto from "crypto";
import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export async function findAllUsers() {
  const result = await (await getBinShabibEstateNet()).request().query("SELECT id,username,email,role,mfaType,otpSecret,createdAt FROM dbo.Users ORDER BY username");
  return result.recordset;
}

export async function createUser(user: { username: string; password: string; email: string; role: string; mfaType: string }) {
  const otpSecret = user.mfaType === "Google Authenticator" ? crypto.randomBytes(10).toString("base64url").toUpperCase() : null;
  const result = await (await getBinShabibEstateNet()).request()
    .input("username", sql.NVarChar(100), user.username).input("password", sql.NVarChar(255), user.password)
    .input("email", sql.NVarChar(255), user.email).input("role", sql.NVarChar(50), user.role)
    .input("mfaType", sql.NVarChar(50), user.mfaType).input("otpSecret", sql.NVarChar(100), otpSecret)
    .query("INSERT dbo.Users(username,password,email,role,mfaType,otpSecret) OUTPUT INSERTED.id,INSERTED.username,INSERTED.email,INSERTED.role,INSERTED.mfaType,INSERTED.otpSecret VALUES(@username,@password,@email,@role,@mfaType,@otpSecret)");
  return result.recordset[0];
}

export async function deleteUser(id: number) { await (await getBinShabibEstateNet()).request().input("id", sql.Int, id).query("DELETE FROM dbo.Users WHERE id=@id"); }
export async function findNationalityRules() { return (await (await getBinShabibEstateNet()).request().query("SELECT * FROM dbo.NationalityAutoRejections ORDER BY nationality")).recordset; }

export async function saveNationalityRule(nationality: string) {
  const result = await (await getBinShabibEstateNet()).request().input("nationality", sql.NVarChar(100), nationality)
    .query("MERGE dbo.NationalityAutoRejections AS target USING (SELECT @nationality AS nationality) AS source ON LOWER(target.nationality)=LOWER(source.nationality) WHEN MATCHED THEN UPDATE SET isActive=1,updatedAt=SYSDATETIME() WHEN NOT MATCHED THEN INSERT(nationality,isActive) VALUES(source.nationality,1) OUTPUT INSERTED.*;");
  return result.recordset[0];
}

export async function updateNationalityRule(id: number, nationality?: string, isActive?: boolean) {
  const result = await (await getBinShabibEstateNet()).request().input("id", sql.Int, id).input("nationality", sql.NVarChar(100), nationality ?? null).input("isActive", sql.Bit, isActive ?? null)
    .query("UPDATE dbo.NationalityAutoRejections SET nationality=COALESCE(@nationality,nationality),isActive=COALESCE(@isActive,isActive),updatedAt=SYSDATETIME() OUTPUT INSERTED.* WHERE id=@id");
  return result.recordset[0] ?? null;
}

export async function deleteNationalityRule(id: number) { await (await getBinShabibEstateNet()).request().input("id", sql.Int, id).query("DELETE FROM dbo.NationalityAutoRejections WHERE id=@id"); }
export async function findPassport(id: number) { const result = await (await getBinShabibEstateNet()).request().input("id", sql.Int, id).query("SELECT passportPath FROM dbo.Bookings WHERE id=@id"); return result.recordset[0]?.passportPath ?? null; }
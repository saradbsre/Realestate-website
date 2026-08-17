import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export interface NewEnquiry { name: string; email: string; phone: string; nationality: string; subject: string | null; message: string; }

export async function insertEnquiry(enquiry: NewEnquiry) {
  const result = await (await getBinShabibEstateNet()).request()
    .input("name", sql.NVarChar(150), enquiry.name).input("email", sql.NVarChar(255), enquiry.email)
    .input("phone", sql.NVarChar(50), enquiry.phone).input("nationality", sql.NVarChar(100), enquiry.nationality)
    .input("subject", sql.NVarChar(255), enquiry.subject).input("message", sql.NVarChar(sql.MAX), enquiry.message)
    .query("INSERT dbo.Enquiries(name,email,phone,nationality,subject,message) OUTPUT INSERTED.id VALUES(@name,@email,@phone,@nationality,@subject,@message)");
  return result.recordset[0];
}

import sql from "mssql";
import { getBinShabibNet192626 } from "../config/BinShabibNet";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export async function findBinShabibNet192626Properties() {
  const connection = await getBinShabibNet192626();
  return (await connection.request().query("SELECT erpId,title,description,price,location,type,purpose,status,beds,baths,area,images FROM dbo.Properties")).recordset;
}

export async function upsertBinShabibEstateNetProperty(item: Record<string, unknown>) {
  const connection = await getBinShabibEstateNet();
  const result = await connection.request()
    .input("erpId", sql.NVarChar(100), item.erpId).input("title", sql.NVarChar(255), item.title).input("description", sql.NVarChar(sql.MAX), item.description)
    .input("price", sql.Decimal(18, 2), item.price).input("location", sql.NVarChar(255), item.location).input("type", sql.NVarChar(50), item.type)
    .input("purpose", sql.NVarChar(50), item.purpose).input("status", sql.NVarChar(50), item.status).input("beds", sql.Int, item.beds)
    .input("baths", sql.Int, item.baths).input("area", sql.Decimal(18, 2), item.area).input("images", sql.NVarChar(sql.MAX), item.images || "[]")
    .query(`UPDATE dbo.Properties SET title=@title,description=@description,price=@price,location=@location,type=@type,purpose=@purpose,status=@status,beds=@beds,baths=@baths,area=@area,images=@images,updatedAt=SYSDATETIME() WHERE erpId=@erpId;
      IF @@ROWCOUNT=0 BEGIN INSERT dbo.Properties(erpId,title,description,price,location,type,purpose,status,beds,baths,area,images) VALUES(@erpId,@title,@description,@price,@location,@type,@purpose,@status,@beds,@baths,@area,@images); SELECT CAST(1 AS bit) inserted; END ELSE SELECT CAST(0 AS bit) inserted;`);
  return Boolean(result.recordset[0]?.inserted);
}

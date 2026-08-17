import sql from "mssql";

const binShabibNet192626Config: sql.config = {
  server: process.env.BINSHABIBNET192626_DB_SERVER!,
  port: Number(process.env.BINSHABIBNET192626_DB_PORT || 1433),
  database: process.env.BINSHABIBNET192626_DB_NAME!,
  user: process.env.BINSHABIBNET192626_DB_USER!,
  password: process.env.BINSHABIBNET192626_DB_PASSWORD!,
  options: { encrypt: false, trustServerCertificate: true },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let binShabibNet192626Promise: Promise<sql.ConnectionPool> | null = null;

export function getBinShabibNet192626(): Promise<sql.ConnectionPool> {
  if (!binShabibNet192626Promise) {
    binShabibNet192626Promise = new sql.ConnectionPool(binShabibNet192626Config).connect().catch((error) => {
      binShabibNet192626Promise = null;
      throw error;
    });
  }
  return binShabibNet192626Promise;
}

export async function closeBinShabibNet192626() {
  const connection = await binShabibNet192626Promise;
  binShabibNet192626Promise = null;
  await connection?.close();
}

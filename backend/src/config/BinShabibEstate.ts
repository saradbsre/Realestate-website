import sql from "mssql";

const binShabibEstateNetConfig: sql.config = {
  server: process.env.BINSHABIBESTATENET_DB_SERVER!,
  port: Number(process.env.BINSHABIBESTATENET_DB_PORT || 1433),
  database: process.env.BINSHABIBESTATENET_DB_NAME!,
  user: process.env.BINSHABIBESTATENET_DB_USER!,
  password: process.env.BINSHABIBESTATENET_DB_PASSWORD!,
  options: { encrypt: false, trustServerCertificate: true },
  pool: { max: 20, min: 0, idleTimeoutMillis: 30000 },
};

let binShabibEstateNetPromise: Promise<sql.ConnectionPool> | null = null;

export function getBinShabibEstateNet(): Promise<sql.ConnectionPool> {
  if (!binShabibEstateNetPromise) {
    binShabibEstateNetPromise = new sql.ConnectionPool(binShabibEstateNetConfig).connect().catch((error) => {
      binShabibEstateNetPromise = null;
      throw error;
    });
  }
  return binShabibEstateNetPromise;
}

export async function closeBinShabibEstateNet() {
  const connection = await binShabibEstateNetPromise;
  binShabibEstateNetPromise = null;
  await connection?.close();
}

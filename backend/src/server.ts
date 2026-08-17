import "dotenv/config";
import app from "./app";
import { getBinShabibEstateNet, closeBinShabibEstateNet } from "./config/BinShabibEstate";
import { closeBinShabibNet192626 } from "./config/BinShabibNet";

const PORT = Number(process.env.PORT || 5000);

async function start() {
  const server = app.listen(PORT, () => console.log(`Real Estate API running on port ${PORT}`));

  getBinShabibEstateNet()
    .then(() => console.log("BinShabibEstateNet connected"))
    .catch((error) => console.error("BinShabibEstateNet unavailable; API remains online", error.message));

  const shutdown = () => server.close(async () => {
    await Promise.allSettled([closeBinShabibEstateNet(), closeBinShabibNet192626()]);
    process.exit(0);
  });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Unable to start the API", error);
  process.exit(1);
});

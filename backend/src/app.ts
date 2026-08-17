import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import propertyRoutes from "./routes/property.routes";
import bookingRoutes from "./routes/booking.routes";
import enquiryRoutes from "./routes/enquiry.routes";
import authRoutes from "./routes/auth.routes";
import syncRoutes from "./routes/sync.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log(
    `🟢 BACKEND REQUEST: ${req.method} ${req.originalUrl}`
  );

  next();
});
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Real Estate Backend",
  });
});

app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/admin/sync", syncRoutes);

app.use((req, res) => res.status(404).json({ error: "API route not found" }));

app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default app;

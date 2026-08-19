import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import enquiryRoutes from "./routes/enquiry.routes";
import authRoutes from "./routes/auth.routes";
import syncRoutes from "./routes/sync.routes";
import propertyRoutes from "./routes/property.routes";
import bookingRoutes from "./routes/booking.routes";

const app = express();

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:3005",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Allow requests without Origin header
       * such as Postman, Render health check, etc.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      console.error(
        "Blocked by CORS:",
        origin
      );

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(cookieParser());

app.use(
  (req, _res, next) => {
    console.log(
      `🟢 BACKEND REQUEST: ${req.method} ${req.originalUrl}`
    );

    next();
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/api/health",
  (_req, res) => {
    res
      .status(200)
      .json({
        success: true,
        service:
          "Real Estate Backend",
        status: "ok",
        timestamp:
          new Date().toISOString(),
      });
  }
);

/* =========================================================
   ROUTES
========================================================= */

app.use(
  "/api/properties",
  propertyRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/enquiries",
  enquiryRoutes
);

app.use(
  "/api/admin",
  authRoutes
);

app.use(
  "/api/admin/sync",
  syncRoutes
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        success: false,
        error:
          "API route not found",
      });
  }
);

/* =========================================================
   MULTER / UPLOAD ERRORS
========================================================= */

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Passport copy must not exceed 5 MB.",
          });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Only one passport file can be uploaded.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid file upload.",
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Passport must be PDF, JPG or PNG."
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            error.message,
        });
    }

    next(error);
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "Unhandled backend error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Internal server error",
      });
  }
);

export default app;
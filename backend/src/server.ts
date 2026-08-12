import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";
import prisma from "./lib/db";
import { verifyTOTP } from "./lib/totp";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credential support
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Multer parser for handling multi-part form data uploads (passports copy)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

// HTML escaping helper for email safety
const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));

// Helper: Check Admin Authentication Middleware
const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sessionToken = req.cookies.admin_session;
  if (!sessionToken) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const data = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf8"));
    if (["Super Admin", "Manager", "Editor"].includes(data.role)) {
      (req as any).adminUser = data;
      return next();
    }
  } catch (err) {
    // Ignore and return 403
  }
  return res.status(403).json({ error: "Unauthorized" });
};

// Helper: Check Super Admin Role Middleware
const isSuperAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sessionToken = req.cookies.admin_session;
  if (!sessionToken) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const data = JSON.parse(Buffer.from(sessionToken, "base64").toString("utf8"));
    if (data.role === "Super Admin") {
      (req as any).adminUser = data;
      return next();
    }
  } catch (err) {
    // Ignore and return 403
  }
  return res.status(403).json({ error: "Unauthorized" });
};

// ==========================================
// 🏢 Properties Endpoints
// ==========================================

// GET /api/properties - Retrieve all listings
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// GET /api/properties/:id - Retrieve single property detail
app.get("/api/properties/:id", async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id, 10);
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    return res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({ error: "Failed to fetch property" });
  }
});

// POST /api/properties/:id/images - Manual uploads disabled (returns 405)
app.post("/api/properties/:id/images", (req, res) => {
  return res.status(405).json({
    error: "Manual image uploads are disabled. Update the ERP property record and synchronize again.",
  });
});

// DELETE /api/properties/:id - Manual deletions disabled (returns 405)
app.delete("/api/properties/:id", (req, res) => {
  return res.status(405).json({
    error: "Manual property deletion is disabled. Update the ERP record and synchronize again.",
  });
});

// ==========================================
// 🏗️ Upcoming Projects Endpoints
// ==========================================

// GET /api/upcoming-projects - Retrieve projects
app.get("/api/upcoming-projects", async (req, res) => {
  try {
    const projects = await prisma.upcomingProject.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(projects);
  } catch (error) {
    console.error("Error fetching upcoming projects:", error);
    return res.status(500).json({ error: "Failed to fetch upcoming projects" });
  }
});

// ==========================================
// 🔄 ERP Sync Engine Endpoints
// ==========================================

// POST /api/sync - Run mock property database synchronization
app.post("/api/sync", async (req, res) => {
  try {
    const mockErpProperties = [
      {
        erpId: "ERP-VILLA-SAADIYAT-001",
        title: "Signature Beachfront Villa | Saadiyat Island",
        description: "An architectural masterpiece situated directly on the Saadiyat coastline. Offers private beach access, a state-of-the-art infinity pool, modern open-plan Italian kitchens, double-height ceilings, and panoramic floor-to-ceiling glass windows overlooking the Arabian Gulf. Built by premier master developers with bespoke luxury specifications.",
        price: 18500000,
        location: "Saadiyat Island, Abu Dhabi",
        type: "Residential",
        purpose: "Buy",
        status: "Ready",
        beds: 5,
        baths: 6,
        area: 7200,
      },
      {
        erpId: "ERP-MANSION-YAS-002",
        title: "Yas Island Championship Golf Course Mansion",
        description: "Nestled adjacent to the championship golf green, this expansive mansion features custom automated systems, a private home cinema, a separate driver/maid pavilion, a premium pool deck, and lush landscaped gardens. Ideal for families looking for prestige, privacy, and convenience close to Yas Mall and theme parks.",
        price: 11200000,
        location: "Yas Island, Abu Dhabi",
        type: "Residential",
        purpose: "Buy",
        status: "Ready",
        beds: 4,
        baths: 5,
        area: 5800,
      },
      {
        erpId: "ERP-PENTHOUSE-DOWNTOWN-003",
        title: "Burj Khalifa & Fountain View Skyline Penthouse",
        description: "An ultra-luxury high-floor penthouse overlooking the iconic Burj Khalifa and the Dubai Fountains. Features custom marble flooring, premium built-in Gaggenau kitchen appliances, smart home integrations, walk-in closets, and an expansive 60-foot private terrace offering unparalleled sunset views of Downtown Dubai.",
        price: 8900000,
        location: "Downtown Dubai, Dubai",
        type: "Residential",
        purpose: "Buy",
        status: "Ready",
        beds: 3,
        baths: 4,
        area: 3200,
      },
      {
        erpId: "ERP-APT-MARINA-004",
        title: "Skyview 2-Bedroom Condo | Dubai Marina",
        description: "Stunning, high-floor apartment located in a luxury high-rise in Dubai Marina. Spectacular marina view from both bedrooms, master walk-in shower, open-plan living and dining spaces, and immediate pedestrian access to the Dubai Marina Walk, restaurants, and tram links.",
        price: 3400000,
        location: "Dubai Marina, Dubai",
        type: "Residential",
        purpose: "Buy",
        status: "Ready",
        beds: 2,
        baths: 3,
        area: 1450,
      },
      {
        erpId: "ERP-OFFICE-BAY-005",
        title: "Fully Fitted Corporate Office | Business Bay",
        description: "Premium commercial office space located on a high floor in Business Bay. Fully fitted with boardrooms, executive cabins, open desk spaces, server room, and private pantry. Stunning canal views, dedicated parking bays, and 24/7 building security check-in.",
        price: 180000,
        location: "Business Bay, Dubai",
        type: "Commercial",
        purpose: "Rent",
        status: "Ready",
        beds: 0,
        baths: 2,
        area: 2100,
      },
      {
        erpId: "ERP-PALM-OFFPLAN-006",
        title: "Off-Plan Signature Lagoon Villa | Palm Jumeirah",
        description: "An exclusive opportunity to secure a signature lagoon villa on Palm Jumeirah. Expected completion Q4 2027. Features private swimming pool, internal home elevator, rooftop entertainment deck, and direct private beach access. Flexible post-handover developer payment plan available.",
        price: 42000000,
        location: "Palm Jumeirah, Dubai",
        type: "Residential",
        purpose: "Buy",
        status: "Off-Plan",
        beds: 6,
        baths: 7,
        area: 9500,
      }
    ];

    const results = { inserted: 0, updated: 0, errors: 0 };

    for (const erpProp of mockErpProperties) {
      try {
        const existing = await prisma.property.findFirst({
          where: { erpId: erpProp.erpId },
        });

        if (existing) {
          await prisma.property.update({
            where: { id: existing.id },
            data: {
              title: erpProp.title,
              description: erpProp.description,
              price: erpProp.price,
              location: erpProp.location,
              type: erpProp.type,
              purpose: erpProp.purpose,
              status: erpProp.status,
              beds: erpProp.beds,
              baths: erpProp.baths,
              area: erpProp.area,
            },
          });
          results.updated++;
        } else {
          await prisma.property.create({
            data: {
              erpId: erpProp.erpId,
              title: erpProp.title,
              description: erpProp.description,
              price: erpProp.price,
              location: erpProp.location,
              type: erpProp.type,
              purpose: erpProp.purpose,
              status: erpProp.status,
              beds: erpProp.beds,
              baths: erpProp.baths,
              area: erpProp.area,
              images: JSON.stringify(["/luxury_villa_hero.jpg"]),
            },
          });
          results.inserted++;
        }
      } catch (err) {
        console.error(`Error syncing property ${erpProp.erpId}:`, err);
        results.errors++;
      }
    }

    return res.json({
      success: true,
      message: "ERP mock property sync completed successfully.",
      results,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({ error: "Failed to run sync engine" });
  }
});

// ==========================================
// 📞 Contact Form Endpoints
// ==========================================

// POST /api/contact - Handle customer contact enquiries
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("=========================================");
    console.log("[NEW ENQUIRY RECEIVED (EXPRESS)]");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log("=========================================");

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || "no-reply@abdulwahedbinshaibproperty.com";

    let emailSent = false;
    let smtpError = null;

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="680" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); margin: 0 auto; border: 1px solid #e2e8f0;">
                    <tr>
                      <td align="center" style="background-color: #ffffff; padding: 32px 24px; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="color: #0b1a30; margin: 0;">ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f58220; height: 4px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 32px; color: #334155;">
                        <h2 style="color: #0b1a30; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Enquiry Receipt Confirmation</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                          Dear <strong>${name}</strong>,<br /><br />
                          Thank you for contacting <strong>ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</strong>. We have received your property inquiry. A copy of your details is listed below:
                        </p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-left: 4px solid #0f4c81; border-radius: 8px; margin-bottom: 28px;">
                          <tr>
                            <td style="padding: 16px 20px; color: #0b1a30; font-size: 14px;">
                              <strong>Inquiry:</strong> ${subject}<br/>
                              <strong>Phone:</strong> ${phone}<br/>
                              <strong>Email:</strong> ${email}<br/>
                              <strong>Message:</strong> "${message}"
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #fafafa; border-top: 1px solid #f1f5f9; padding: 32px 24px; text-align: center; font-size: 12px; color: #64748b;">
                        <strong>ABDULWAHED BIN SHABIB REAL ESTATE L.L.C</strong><br/>
                        🏢 Street # 44A - Hor Al Anz - Deira - Dubai, UAE<br/>
                        📞 Tollfree: 800 22773 | Landline: 04 329 8000
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from,
          to: email,
          subject: `Enquiry Confirmation: ${subject}`,
          html: htmlContent,
        });

        emailSent = true;
      } catch (err: any) {
        console.error("Nodemailer SMTP Error:", err);
        smtpError = err.message || err;
      }
    }

    return res.json({ success: true, emailSent, smtpError });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==========================================
// 📑 Property Booking Form Endpoints
// ==========================================

// POST /api/bookings - Handle property rental bookings with passport attachments
app.post("/api/bookings", upload.single("passport"), async (req, res) => {
  try {
    const { propertyId, propertyName, name, email, phone, nationality } = req.body;
    const passportFile = req.file;

    if (!propertyId || !propertyName || !name || !email || !phone || !nationality || !passportFile) {
      return res.status(400).json({ error: "Please complete all fields and attach a passport copy." });
    }

    const propIdNum = parseInt(propertyId, 10);
    if (passportFile.size > 5 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(passportFile.mimetype)) {
      return res.status(400).json({ error: "Passport copy must be a PDF, JPG, or PNG under 5 MB." });
    }

    const extension = passportFile.mimetype === "application/pdf" ? ".pdf" : passportFile.mimetype === "image/png" ? ".png" : ".jpg";
    const passportBuffer = passportFile.buffer;
    const passportPath = `data:${passportFile.mimetype};base64,${passportBuffer.toString("base64")}`;

    // Check nationality auto-rejection rules
    const autoRejectRule = await prisma.nationalityAutoRejection.findFirst({
      where: { nationality: { equals: nationality.trim(), mode: "insensitive" }, isActive: true },
    });
    const autoRejected = Boolean(autoRejectRule);
    const automaticReason = "The requested unit was reserved very recently and is no longer available.";

    // Save booking
    const booking = await prisma.booking.create({
      data: {
        propertyId: propIdNum,
        propertyName: propertyName.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        nationality: nationality.trim(),
        passportPath,
        status: autoRejected ? "Declined" : "Pending",
        declineReason: autoRejected ? automaticReason : null,
      },
    });

    // Send emails asynchronously
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || "no-reply@abdulwahedbinshaibproperty.com";

    if (host && user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const safe = {
        propertyName: escapeHtml(propertyName),
        name: escapeHtml(name),
        email: escapeHtml(email),
        phone: escapeHtml(phone),
        nationality: escapeHtml(nationality),
      };

      const emailShell = (title: string, body: string) => `
        <!doctype html>
        <html>
        <body style="margin:0;background:#eef3f8;font-family:Arial,sans-serif;color:#1e293b">
          <table width="100%" style="padding:32px 12px">
            <tr>
              <td align="center">
                <table width="680" style="background:#fff;border:1px solid #dbe5ef;border-radius:16px;overflow:hidden">
                  <tr>
                    <td align="center" style="padding:26px;border-bottom:4px solid #f58220;">
                      <strong style="color:#0b1a30;font-size:20px;">ABDULWAHED BIN SHABIB REAL ESTATE</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:38px 40px">
                      <h1 style="margin:0 0 10px;color:#0b1a30;font-size:26px">${title}</h1>
                      ${body}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const detailsCard = `
        <table width="100%" style="margin:24px 0;background:#f8fafc;border:1px solid #dbe5ef;border-left:4px solid #0f4c81;border-radius:10px;padding:20px;">
          <tr>
            <td>
              <strong>BOOKING DETAILS</strong>
              <p>Property: ${safe.propertyName}</p>
              <p>Applicant: ${safe.name}</p>
              <p>Email: ${safe.email}</p>
              <p>Phone: ${safe.phone}</p>
              <p>Nationality: ${safe.nationality}</p>
              <p>Reference: #${booking.id}</p>
            </td>
          </tr>
        </table>
      `;

      const adminText = autoRejected
        ? "The requested unit was reserved very recently and is no longer available. The enquiry has been retained."
        : "A customer has submitted a booking request. Please review the details and passport attachment in the Admin Portal.";

      const customerText = autoRejected
        ? `Thank you for your interest in <strong>${safe.propertyName}</strong>. We are sorry, but this unit was reserved very recently and is no longer available.`
        : `We have received your booking form for <strong>${safe.propertyName}</strong>. Our leasing coordinators will call you shortly.`;

      // Trigger parallel sends
      Promise.all([
        transporter.sendMail({
          from,
          to: "bilal.designer@awsdistribution.com",
          replyTo: email,
          subject: `${autoRejected ? "Booking availability update" : "New"} booking request #${booking.id} — ${propertyName}`,
          html: emailShell(autoRejected ? "Booking availability update" : "New booking request", `<p>${adminText}</p>${detailsCard}`),
          attachments: [{ filename: `passport${extension}`, content: passportBuffer }],
        }),
        transporter.sendMail({
          from,
          to: email,
          subject: `${autoRejected ? "Booking availability update" : "Booking form received"} — ${propertyName}`,
          html: emailShell(`Thank you, ${safe.name}`, `<p>${customerText}</p>${detailsCard}`),
        }),
      ]).catch((err) => console.error("SMTP bookings dispatch failed:", err));
    }

    return res.json({ success: true, bookingId: booking.id, status: booking.status, autoRejected });
  } catch (error) {
    console.error("Booking failed:", error);
    return res.status(500).json({ error: "Booking submission failed" });
  }
});

// ==========================================
// 🔒 Admin Portal Authentication Endpoints
// ==========================================

// POST /api/admin/login - Verify username/password and trigger OTP code
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    // Auto-seed or update default Super Admin
    const defaultAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
    if (!defaultAdmin) {
      await prisma.user.create({
        data: {
          username: "admin",
          password: "ShabibAdmin2026!",
          email: "bilal.designer@awsdistribution.com",
          role: "Super Admin",
          mfaType: "Email OTP",
        },
      });
    } else if (defaultAdmin.email !== "bilal.designer@awsdistribution.com") {
      await prisma.user.update({
        where: { username: "admin" },
        data: { email: "bilal.designer@awsdistribution.com" },
      });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (user.mfaType === "Email OTP") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry },
      });

      console.log(`\n======================================================`);
      console.log(`[OTP SECURITY] EMAIL OTP Code for user "${username}" is: ${otpCode}`);
      console.log(`Sent to email: ${user.email}`);
      console.log(`======================================================\n`);

      return res.json({
        requireOtp: true,
        mfaType: "Email OTP",
        username: user.username,
        email: user.email,
        mockCode: otpCode,
      });
    } else {
      return res.json({
        requireOtp: true,
        mfaType: "Google Authenticator",
        username: user.username,
      });
    }
  } catch (error) {
    console.error("Login endpoint error:", error);
    return res.status(500).json({ error: "Authentication system error" });
  }
});

// POST /api/admin/verify-otp - Verify OTP and output secure session cookie
app.post("/api/admin/verify-otp", async (req, res) => {
  try {
    const { username, code } = req.body;

    if (!username || !code) {
      return res.status(400).json({ error: "Missing username or code" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let isValid = false;

    if (user.mfaType === "Email OTP") {
      if (user.otpCode === code && user.otpExpiry && user.otpExpiry > new Date()) {
        isValid = true;
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpiry: null },
        });
      }
    } else if (user.mfaType === "Google Authenticator" && user.otpSecret) {
      isValid = verifyTOTP(user.otpSecret, code);
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid or expired OTP code" });
    }

    const sessionData = { username: user.username, role: user.role };
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // Output cookie
    res.cookie("admin_session", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    });

    return res.json({ success: true, username: user.username, role: user.role });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal verification error" });
  }
});

// GET /api/admin/check-auth - Retrieve role status of active cookie
app.get("/api/admin/check-auth", async (req, res) => {
  const sessionCookie = req.cookies.admin_session;
  if (!sessionCookie) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const data = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf8"));
    return res.json({ authenticated: true, username: data.username, role: data.role });
  } catch (err) {
    return res.status(401).json({ error: "Invalid session token" });
  }
});

// POST /api/admin/logout - Clear active cookie
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_session", { path: "/" });
  return res.json({ success: true });
});

// ==========================================
// 🛡️ Admin Dashboard Actions (Properties, Users, Rejections)
// ==========================================

// GET /api/admin/bookings - Fetch booking records
app.get("/api/admin/bookings", isAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load bookings" });
  }
});

// PATCH /api/admin/bookings - Modify booking state
app.patch("/api/admin/bookings", isAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !["Pending", "Confirmed", "Declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid booking update" });
    }
    const updated = await prisma.booking.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Booking update failed" });
  }
});

// GET /api/admin/bookings/:id/passport - Download passport base64 string
app.get("/api/admin/bookings/:id/passport", isAdmin, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      select: { passportPath: true },
    });
    if (!booking || !booking.passportPath) {
      return res.status(404).json({ error: "Passport not found" });
    }
    return res.json({ passportPath: booking.passportPath });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load passport" });
  }
});

// GET /api/admin/users - Fetch user list
app.get("/api/admin/users", isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, mfaType: true, createdAt: true },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users - Create new editor/manager
app.post("/api/admin/users", isAdmin, async (req, res) => {
  try {
    const { username, password, email, role, mfaType } = req.body;
    if (!username || !password || !email || !role) {
      return res.status(400).json({ error: "Missing required admin fields" });
    }
    const user = await prisma.user.create({
      data: { username, password, email, role, mfaType: mfaType || "Email OTP" },
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create administrator" });
  }
});

// DELETE /api/admin/users - Delete manager (supports both query param and route param)
app.delete(["/api/admin/users", "/api/admin/users/:id"], isSuperAdmin, async (req, res) => {
  try {
    const rawId = req.params.id || (req.query.id as string);
    const userId = parseInt(rawId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.username === "admin") {
      return res.status(400).json({ error: "The default super admin account cannot be deleted." });
    }
    await prisma.user.delete({ where: { id: userId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Deletion failed" });
  }
});

// GET /api/admin/nationality-rejections - Fetch list
app.get("/api/admin/nationality-rejections", isSuperAdmin, async (req, res) => {
  try {
    const rejections = await prisma.nationalityAutoRejection.findMany({
      orderBy: { nationality: "asc" },
    });
    return res.json(rejections);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load rejection list" });
  }
});

// POST /api/admin/nationality-rejections - Create auto reject rule
app.post("/api/admin/nationality-rejections", isSuperAdmin, async (req, res) => {
  try {
    const nationality = String(req.body.nationality || "").trim();
    if (!nationality) {
      return res.status(400).json({ error: "Nationality is required." });
    }
    const rule = await prisma.nationalityAutoRejection.upsert({
      where: { nationality },
      update: { isActive: true },
      create: { nationality, isActive: true },
    });
    return res.status(201).json(rule);
  } catch (err) {
    return res.status(500).json({ error: "Upsert failed" });
  }
});

// PATCH /api/admin/nationality-rejections - Update rule
app.patch("/api/admin/nationality-rejections", isSuperAdmin, async (req, res) => {
  try {
    const { id, nationality, isActive } = req.body;
    const ruleId = parseInt(id, 10);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: "Invalid rule." });
    }
    const data: any = {};
    if (typeof nationality === "string") data.nationality = nationality.trim();
    if (typeof isActive === "boolean") data.isActive = isActive;
    const updated = await prisma.nationalityAutoRejection.update({
      where: { id: ruleId },
      data,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Update failed" });
  }
});

// DELETE /api/admin/nationality-rejections - Delete rule
app.delete("/api/admin/nationality-rejections", isSuperAdmin, async (req, res) => {
  try {
    const ruleId = parseInt(req.query.id as string, 10);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: "Invalid rule." });
    }
    await prisma.nationalityAutoRejection.delete({ where: { id: ruleId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Delete failed" });
  }
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Decoupled Backend Server Running on Port: ${PORT}`);
  console.log(`Database connected via Prisma Client SQLite`);
  console.log(`======================================================\n`);
});

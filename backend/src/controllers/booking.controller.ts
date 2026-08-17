import { NextFunction, Request, Response } from "express";
import { hasActiveNationalityRejection, insertBooking } from "../repositories/booking.repository";

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId, propertyName, name, email, phone, nationality } = req.body;
    const file = req.file;
    if (![propertyId, propertyName, name, email, phone, nationality].every(Boolean) || !file) return res.status(400).json({ error: "Complete all fields and attach a passport copy." });
    if (!Number.isInteger(Number(propertyId)) || !["application/pdf", "image/jpeg", "image/png"].includes(file.mimetype)) return res.status(400).json({ error: "Passport must be a PDF, JPG, or PNG under 5 MB." });
    const normalizedNationality = String(nationality).trim();
    const autoRejected = await hasActiveNationalityRejection(normalizedNationality);
    const booking = await insertBooking({
      propertyId: Number(propertyId), propertyName: String(propertyName).trim(), name: String(name).trim(),
      email: String(email).trim(), phone: String(phone).trim(), nationality: normalizedNationality,
      passportPath: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    }, autoRejected);
    return res.status(201).json({ success: true, bookingId: booking.id, status: booking.status, autoRejected });
  } catch (error) { return next(error); }
}

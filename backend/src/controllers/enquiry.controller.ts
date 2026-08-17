import { NextFunction, Request, Response } from "express";
import { insertEnquiry } from "../repositories/enquiry.repository";

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, nationality = "", subject = null, message } = req.body;
    if (!name || !email || !phone || !message) return res.status(400).json({ error: "Missing required fields" });
    const enquiry = await insertEnquiry({ name, email, phone, nationality, subject, message });
    return res.status(201).json({ success: true, enquiryId: enquiry.id });
  } catch (error) { return next(error); }
}

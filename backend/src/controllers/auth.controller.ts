import { NextFunction, Request, Response } from "express";
import { readSession } from "../middleware/auth";
import { verifyTOTP } from "../lib/totp";
import { clearOtp, findUserByUsername, saveEmailOtp } from "../repositories/auth.repository";


export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing username or password" });
    const user = await findUserByUsername(username);
    if (!user || user.password !== password) return res.status(401).json({ error: "Invalid username or password" });
    if (user.mfaType === "Google Authenticator") return res.json({ requireOtp: true, mfaType: user.mfaType, username });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await saveEmailOtp(user.id, code);
    console.log(`Email OTP for ${username}: ${code}`);
    return res.json({ requireOtp: true, mfaType: "Email OTP", username, email: user.email });
  } catch (error) { return next(error); }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, code } = req.body;
    if (!username || !code) return res.status(400).json({ error: "Missing username or code" });
    const user = await findUserByUsername(username);
    const valid = user && (user.mfaType === "Email OTP" ? user.otpCode === String(code) && new Date(user.otpExpiry) > new Date() : user.otpSecret && verifyTOTP(user.otpSecret, String(code)));
    if (!valid) return res.status(401).json({ error: "Invalid or expired OTP code" });
    await clearOtp(user.id);
    res.cookie("admin_session", Buffer.from(JSON.stringify({ username: user.username, role: user.role })).toString("base64url"), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400000 });
    return res.json({ success: true, username: user.username, role: user.role });
  } catch (error) { return next(error); }
}

export function checkAuth(req: Request, res: Response) {
  const session = readSession(req);
  return session ? res.json({ authenticated: true, ...session }) : res.status(401).json({ error: "Not authenticated" });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("admin_session");
  return res.json({ success: true });
}

// export async function getBookings(_req: Request, res: Response, next: NextFunction) {
//   try { return res.json(await findAllBookings()); }
//   catch (error) { return next(error); }
// }

// export async function updateBooking(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id, status } = req.body;
//     if (!Number.isInteger(Number(id)) || !["Pending", "Confirmed", "Declined"].includes(status)) return res.status(400).json({ error: "Invalid booking update" });
//     const booking = await updateBookingStatus(Number(id), status);
//     return booking ? res.json(booking) : res.status(404).json({ error: "Booking not found" });
//   } catch (error) { return next(error); }
// }

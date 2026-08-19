import { Router } from "express";
import { checkAuth, login, logout, verifyOtp } from "../controllers/auth.controller";
import { requireAdmin } from "../middleware/auth";

const router = Router();
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/check-auth", checkAuth);
router.post("/logout", logout);
// router.get("/bookings", requireAdmin, getBookings);
// router.patch("/bookings", requireAdmin, updateBooking);
export default router;

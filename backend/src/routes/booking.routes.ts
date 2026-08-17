import { Router } from "express";
import multer from "multer";
import { createBooking } from "../controllers/booking.controller";

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", upload.single("passport"), createBooking);

export default router;

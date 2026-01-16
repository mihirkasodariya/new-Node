import { Router } from "express";
const router = Router();
import { earlyAccess } from "../controllers/authController.js";

router.post("/earlyAccess", earlyAccess);


export default router;
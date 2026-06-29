import { Router } from "express";
import {
  registration as registrationMiddleware,
  login as loginMiddleware,
} from "../middleware/validation.middleware.js";
import {
  registration as registrationController,
  login as loginController,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/registration", [registrationMiddleware, registrationController]);
router.post("/login", [loginMiddleware, loginController]);

export default router;

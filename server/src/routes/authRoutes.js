import express from "express";

import {
    register,
    login,
    getCurrentUser,
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
    registerSchema,
    loginSchema,
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, getCurrentUser);

export default router;
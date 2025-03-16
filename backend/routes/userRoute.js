import express from "express";
import {login, logout, register, updatePassword } from "../controllers/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
// import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/update-password").post(isAuthenticated, updatePassword);

export default router;
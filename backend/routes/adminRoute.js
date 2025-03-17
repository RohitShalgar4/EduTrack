import express from "express";
import { addAdmin, getAllAdmins, getAdmin, updateAdmin, deleteAdmin, updateAdminPassword } from "../controllers/adminController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Only super_admin can manage other admins
router.post("/add", isAuthenticated, checkRole("super_admin"), addAdmin);
router.get("/all", isAuthenticated, checkRole("super_admin"), getAllAdmins);
router.get("/:id", isAuthenticated, checkRole("super_admin"), getAdmin);
router.put("/:id", isAuthenticated, checkRole("super_admin"), updateAdmin);
router.delete("/:id", isAuthenticated, checkRole("super_admin"), deleteAdmin);

// Password update route (accessible by both super_admin and department_admin)
router.post("/update-password", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateAdminPassword);

export default router; 
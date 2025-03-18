import express from "express";
import { 
    addAdmin, 
    getAllAdmins, 
    getAdmin, 
    updateAdmin, 
    deleteAdmin, 
    updateAdminPassword, 
    getStudentsByDepartment, 
    getTeachersByDepartment,
    getAllStudents,  // New function for super admin
    getAllTeachers,   // New function for super admin
    updateStudentDetails
} from "../controllers/adminController.js";
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

// Super admin routes for fetching all students and teachers
router.get("/all/students", isAuthenticated, checkRole("super_admin"), getAllStudents);
router.get("/all/teachers", isAuthenticated, checkRole("super_admin"), getAllTeachers);

// Department admin routes for fetching department-specific students and teachers
router.get("/department/students", isAuthenticated, checkRole("department_admin"), getStudentsByDepartment);
router.get("/department/teachers", isAuthenticated, checkRole("department_admin"), getTeachersByDepartment);

// Department admin route for updating student details
router.put("/student/:studentId", isAuthenticated, checkRole("department_admin"), updateStudentDetails);

export default router; 
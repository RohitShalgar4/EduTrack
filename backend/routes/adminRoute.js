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
import {
  getTeacher,
  updateTeacher,
  updateTeacherPhoto
} from "../controllers/teacherController.js";

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

// Update teacher in department
router.put("/department/teachers/:teacherId", isAuthenticated, checkRole("department_admin"), updateTeacher);

// Update teacher photo in department
router.post("/department/teachers/:teacherId/photo", isAuthenticated, checkRole("department_admin"), updateTeacherPhoto);

// Department admin route for updating student details
router.put("/student/:studentId", isAuthenticated, checkRole("department_admin"), updateStudentDetails);

// Get single teacher details
router.get("/teacher/:teacherId", isAuthenticated, checkRole(["super_admin", "department_admin"]), getTeacher);

// Update teacher details
router.put("/department/teachers/:teacherId", isAuthenticated, checkRole(["department_admin"]), updateTeacher);
router.put("/teacher/:teacherId", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateTeacher);

// Update teacher photo
router.post("/department/teachers/:teacherId/photo", isAuthenticated, checkRole(["department_admin"]), updateTeacherPhoto);
router.post("/teacher/:teacherId/photo", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateTeacherPhoto);

export default router; 
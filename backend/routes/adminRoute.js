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
    updateStudentDetails,
    getAdminDetails,
    updateAdminDetails,
    importStudentsFromCSV,
    deleteStudent,
    deleteTeacher,  // New function for deleting teachers
    generateExportReport,
    getStudentsForExport,
    getDepartmentsForExport,
    getAllClasses,    // New function for getting all classes
    getClassesByDepartment,  // New function for getting department classes
    getStudentsByClass  // New function for getting students by class
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
router.put("/student/:studentId", isAuthenticated, checkRole(["super_admin", "department_admin"] ), updateStudentDetails);

// Get single teacher details
router.get("/teacher/:teacherId", isAuthenticated, checkRole(["super_admin", "department_admin"]), getTeacher);

// Get single teacher details
router.get("/:adminId", isAuthenticated, checkRole(["super_admin"]), getAdminDetails);

// Update teacher details
router.put("/department/teachers/:teacherId", isAuthenticated, checkRole(["department_admin"]), updateTeacher);
router.put("/teacher/:teacherId", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateTeacher);

// Update teacher photo
router.post("/department/teachers/:teacherId/photo", isAuthenticated, checkRole(["department_admin"]), updateTeacherPhoto);
router.post("/teacher/:teacherId/photo", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateTeacherPhoto);

// Admin details routes (super_admin only)
router.get('/admin/:adminId', isAuthenticated, checkRole("super_admin"), getAdminDetails);
router.put('/admin/:adminId', isAuthenticated, checkRole("super_admin"), updateAdminDetails);

// New route for CSV import
router.post("/import-students", isAuthenticated, checkRole(["department_admin", "super_admin"]), importStudentsFromCSV);

// New route for deleting a student
router.delete("/students/:studentId", isAuthenticated, checkRole(["super_admin", "department_admin"]), deleteStudent);

// New route for deleting a teacher
router.delete("/teachers/:teacherId", isAuthenticated, checkRole(["super_admin", "department_admin"]), deleteTeacher);

// Export routes
router.post('/export/generate', isAuthenticated, checkRole(["super_admin", "department_admin", "teacher"]), generateExportReport);
router.get('/export/students', isAuthenticated, checkRole(["super_admin", "department_admin", "teacher"]), getStudentsForExport);
router.get('/export/departments', isAuthenticated, checkRole(["super_admin", "department_admin", "teacher"]), getDepartmentsForExport);

// Class-related routes
router.get("/all/classes", isAuthenticated, checkRole("super_admin"), getAllClasses);
router.get("/department/classes", isAuthenticated, checkRole("department_admin"), getClassesByDepartment);
router.get("/class/:class/students", isAuthenticated, checkRole(["super_admin", "department_admin"]), getStudentsByClass);

export default router; 
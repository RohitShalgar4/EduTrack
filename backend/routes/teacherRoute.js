import express from "express";
import { addTeacher, getAllTeachers, getTeacher, updateTeacher, deleteTeacher, getTeacherStudents, getStudentDetails, updateStudentDetails, getTeachersByDepartment } from "../controllers/teacherController.js";
import { updatePassword } from "../controllers/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// Both super_admin and department_admin can manage teachers
// router.post("/add", isAuthenticated, checkRole(["super_admin", "department_admin"]), addTeacher);
router.post("/add", isAuthenticated, checkRole(["super_admin", "department_admin"]), addTeacher);
router.get("/all", isAuthenticated, checkRole(["super_admin", "department_admin"]), getAllTeachers);
router.get("/:id", isAuthenticated, checkRole(["super_admin", "department_admin", "teacher"]), getTeacher);
router.put("/:id", isAuthenticated, checkRole(["super_admin", "department_admin"]), updateTeacher);
router.delete("/:id", isAuthenticated, checkRole(["super_admin"]), deleteTeacher); // Only super_admin can delete teachers

// Teacher routes for managing students
router.get("/students/all", isAuthenticated, checkRole("teacher"), getTeacherStudents);
router.get("/student/:studentId", isAuthenticated, checkRole("teacher"), getStudentDetails);
router.put("/student/:studentId", isAuthenticated, checkRole("teacher"), updateStudentDetails);

// Teacher password update route - ensure user is a teacher
router.post("/update-password", isAuthenticated, checkRole("teacher"), updatePassword);

// Add the new route for getting teachers by department
router.get("/department", isAuthenticated, checkRole("admin"), getTeachersByDepartment);

export default router; 
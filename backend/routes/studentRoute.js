import express from 'express';
import { getStudentData } from '../controllers/studentController.js';
import isAuthenticated from "../middleware/isAuthenticated.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// All authenticated users can access student data
router.route('/').get(isAuthenticated, getStudentData);

// Specific student data can be accessed by admins, teachers, and the student themselves
router.route('/:id').get(isAuthenticated, checkRole(["super_admin", "department_admin", "teacher", "student"]), getStudentData);

export default router;
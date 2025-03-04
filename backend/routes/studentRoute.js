import express from 'express';
import { getStudentData } from '../controllers/studentController.js';

const router = express.Router();

// Route to fetch student data
router.route('/').get(getStudentData);
router.route('/:id').get(getStudentData);
export default router;
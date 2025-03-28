import express from 'express';
import { getCloudinaryConfig } from '../controllers/configController.js';
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.get('/cloudinary', isAuthenticated, getCloudinaryConfig);

export default router; 
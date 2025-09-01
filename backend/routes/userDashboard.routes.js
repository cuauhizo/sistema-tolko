import { Router } from 'express';
import { getUserDashboardStats } from '../controllers/userDashboard.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

// Cualquier usuario logueado puede acceder a sus propias estadísticas
router.get('/', [verifyToken], getUserDashboardStats);

export default router;

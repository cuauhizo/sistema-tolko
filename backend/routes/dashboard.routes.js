import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

// Protegemos la ruta para que solo usuarios autenticados puedan ver el dashboard
router.get('/', [verifyToken], getDashboardStats);

export default router;

import { Router } from 'express';
import { getInventoryMovements } from '../controllers/inventory.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Solo los administradores pueden ver el historial de inventario
router.get('/movements', [verifyToken, isAdmin], getInventoryMovements);

export default router;

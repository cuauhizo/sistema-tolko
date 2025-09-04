import { Router } from 'express';
import {
  createWorkOrder, getWorkOrders, updateWorkOrder, deleteWorkOrder,
  getMyWorkOrders, getWorkOrderById, updateWorkOrderStatus
} from '../controllers/workOrders.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// --- Rutas Generales y de Admin ---
router.get('/', [verifyToken, isAdmin], getWorkOrders);
router.post('/', [verifyToken, isAdmin], createWorkOrder);

// --- Rutas Específicas de Usuario ---
// La ruta estática '/myorders' va ANTES de cualquier ruta dinámica con '/:param'
router.get('/myorders', [verifyToken], getMyWorkOrders);

// --- Rutas Dinámicas (por ID) ---
router.get('/:id', [verifyToken, isAdmin], getWorkOrderById);
router.put('/:id', [verifyToken, isAdmin], updateWorkOrder);
router.delete('/:id', [verifyToken, isAdmin], deleteWorkOrder);
router.patch('/:id/status', [verifyToken], updateWorkOrderStatus);

export default router;
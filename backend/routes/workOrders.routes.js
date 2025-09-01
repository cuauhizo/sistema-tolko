import { Router } from 'express';
import {
  createWorkOrder,
  getWorkOrders,
  updateWorkOrder,
  deleteWorkOrder,
  getWorkOrderById,
} from '../controllers/workOrders.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Rutas para Admin
router.get('/', [verifyToken, isAdmin], getWorkOrders);
router.get('/:id', [verifyToken, isAdmin], getWorkOrderById);
router.post('/', [verifyToken, isAdmin], createWorkOrder);
router.put('/:id', [verifyToken, isAdmin], updateWorkOrder);
router.delete('/:id', [verifyToken, isAdmin], deleteWorkOrder);

export default router;

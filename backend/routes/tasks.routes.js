import { Router } from 'express';
import {
  getTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// --- Rutas para Administradores ---
// Un admin puede ver todas las tareas y crear nuevas
router.get('/', [verifyToken, isAdmin], getTasks);
router.post('/', [verifyToken, isAdmin], createTask);
router.put('/:id', [verifyToken, isAdmin], updateTask);
router.delete('/:id', [verifyToken, isAdmin], deleteTask);

// --- Rutas para Usuarios ---
// Cualquier usuario logueado puede ver sus propias tareas
router.get('/mytasks', [verifyToken], getMyTasks);
// Cualquier usuario logueado puede actualizar el estado de una de sus tareas
router.patch('/:id/status', [verifyToken], updateTaskStatus);

export default router;

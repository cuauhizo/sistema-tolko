import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../controllers/users.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// --- para el cambio de contraseña del propio usuario ---
router.post('/change-password', [verifyToken], changePassword);

// Solo los administradores podrán crear, actualizar o eliminar usuario
router.get('/', [verifyToken, isAdmin], getUsers);
router.post('/', [verifyToken, isAdmin], createUser);
router.put('/:id', [verifyToken, isAdmin], updateUser);
router.delete('/:id', [verifyToken, isAdmin], deleteUser);

export default router;

import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Solo los administradores podrán crear, actualizar o eliminar usuario
router.get('/', [verifyToken, isAdmin], getUsers);
router.post('/', [verifyToken, isAdmin], createUser);
router.put('/:id', [verifyToken, isAdmin], updateUser);
router.delete('/:id', [verifyToken, isAdmin], deleteUser);

export default router;

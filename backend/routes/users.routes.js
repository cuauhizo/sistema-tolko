import { Router } from 'express';
import * as userController from '../controllers/users.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Todas las rutas de este archivo ya parten de /api/users (lo definiremos en app.js)
// Y todas requerirán que el usuario esté autenticado y sea administrador.
router.use(verifyToken, isAdmin);

// OBTENER todos los usuarios
// GET /api/users
router.get('/', userController.getUsers);

// CREAR un nuevo usuario
// POST /api/users
router.post('/', userController.createUser);

// OBTENER un solo usuario por ID
// GET /api/users/:id
router.get('/:id', userController.getUserById);

// ACTUALIZAR un usuario por ID
// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// ELIMINAR un usuario por ID
// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

export default router;
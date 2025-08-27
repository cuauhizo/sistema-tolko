import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Cualquier usuario autenticado podrá ver la lista de categorías (útil para los formularios)
router.get('/', [verifyToken], getCategories);

// Solo los administradores podrán crear, actualizar o eliminar categorías
router.post('/', [verifyToken, isAdmin], createCategory);
router.put('/:id', [verifyToken, isAdmin], updateCategory);
router.delete('/:id', [verifyToken, isAdmin], deleteCategory);

export default router;

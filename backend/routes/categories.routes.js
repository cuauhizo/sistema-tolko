import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Solo los administradores podrán crear, actualizar o eliminar categorías
router.get('/', [verifyToken, isAdmin], getCategories);
router.post('/', [verifyToken, isAdmin], createCategory);
router.put('/:id', [verifyToken, isAdmin], updateCategory);
router.delete('/:id', [verifyToken, isAdmin], deleteCategory);

export default router;

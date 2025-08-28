import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import { verifyToken, isAdmin } from '../middlewares/authJwt.js';

const router = Router();

// Cualquiera puede ver los productos
router.get('/', [verifyToken], getProducts);
// Solo usuarios autenticados Y que sean admin pueden crear, actualizar o eliminar
router.post('/', [verifyToken, isAdmin], createProduct);
router.put('/:id', [verifyToken, isAdmin], updateProduct);
router.delete('/:id', [verifyToken, isAdmin], deleteProduct);

export default router;

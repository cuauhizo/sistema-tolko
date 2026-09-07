import { Router } from 'express'
import * as productController from '../controllers/products.controller.js'
import { verifyToken, hasPermission, hasRole } from '../middlewares/authJwt.js'

const router = Router()

// 1. Verificación básica: Debe tener sesión iniciada para cualquier cosa
router.use(verifyToken)

// 2. RUTAS DE LECTURA (Disponibles para todos, necesarias para llenar los selects en las órdenes)
router.get('/low-stock', productController.getLowStockProducts)
router.get('/', productController.getProducts)
router.get('/:id', productController.getProductById)

// 3. RUTAS DE MODIFICACIÓN (Solo quienes tengan el permiso específico pueden alterar el inventario)
// Si prefieres usar roles temporalmente, cámbialo por: const canManage = hasRole(['superadmin', 'administracion']);
const canManage = hasPermission('manage_inventory')

router.post('/', canManage, productController.createProduct)
router.put('/:id', canManage, productController.updateProduct)
router.delete('/:id', canManage, productController.deleteProduct)

export default router

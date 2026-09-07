import { Router } from 'express'
import * as supplierController from '../controllers/suppliers.controller.js'
// 1. Cambiamos hasRole por hasPermission
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Protegemos que deba existir un token
router.use(verifyToken)

// 2. Aplicamos permisos granulares a cada ruta específica
router.get('/', hasPermission('read_suppliers'), supplierController.getSuppliers)
router.get('/:id', hasPermission('read_suppliers'), supplierController.getSupplierById)
router.post('/', hasPermission('create_suppliers'), supplierController.createSupplier)
router.put('/:id', hasPermission('update_suppliers'), supplierController.updateSupplier)
router.delete('/:id', hasPermission('delete_suppliers'), supplierController.deleteSupplier)

export default router

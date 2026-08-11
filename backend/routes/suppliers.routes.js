import { Router } from 'express'
import * as supplierController from '../controllers/suppliers.controller.js'
import { verifyToken } from '../middlewares/authJwt.js'

const router = Router()

// Protegemos todas las rutas con verifyToken
router.use(verifyToken)

router.get('/', supplierController.getSuppliers)
router.get('/:id', supplierController.getSupplierById)
router.post('/', supplierController.createSupplier)
router.put('/:id', supplierController.updateSupplier)
router.delete('/:id', supplierController.deleteSupplier)

export default router

import { Router } from 'express'
import { getMovements, createMovement } from '../controllers/inventory.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Solo quienes tengan permiso de ver el historial pueden hacer el GET
router.get('/movements', [verifyToken, hasPermission('read_inventory')], getMovements)

// Solo quienes tengan permiso de "Ajustes manuales" pueden registrar movimientos
router.post('/movements', [verifyToken, hasPermission('manage_inventory')], createMovement)

export default router

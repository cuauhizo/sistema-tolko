import { Router } from 'express'
import { getMovements, createMovement } from '../controllers/inventory.controller.js'
import { verifyToken, isAdmin } from '../middlewares/authJwt.js'

const router = Router()

// Solo los administradores pueden ver el historial de inventario
router.get('/movements', [verifyToken, isAdmin], getMovements)
router.post('/movements', [verifyToken, isAdmin], createMovement)

export default router

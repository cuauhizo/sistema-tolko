import { Router } from 'express'
import { createWorkOrder, getWorkOrders, updateWorkOrder, deleteWorkOrder, getMyWorkOrders, getWorkOrderById, updateWorkOrderStatus, addProductToOrder } from '../controllers/workOrders.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// --- Rutas Generales y de Gestión ---
router.get('/', [verifyToken, hasPermission('read_workorders')], getWorkOrders)
router.post('/', [verifyToken, hasPermission('create_workorders')], createWorkOrder)

// --- Rutas Específicas de Usuario (Operativos) ---
// La ruta estática '/myorders' va ANTES de cualquier ruta dinámica con '/:param'
router.get('/myorders', [verifyToken], getMyWorkOrders)

// --- Rutas Dinámicas (por ID) ---
router.get('/:id', [verifyToken, hasPermission('read_workorders')], getWorkOrderById)
router.put('/:id', [verifyToken, hasPermission('update_workorders')], updateWorkOrder)
router.delete('/:id', [verifyToken, hasPermission('delete_workorders')], deleteWorkOrder)

// Estas dos se quedan con verifyToken para permitir que un trabajador cambie
// el estado de su orden o le agregue productos sin necesitar permisos administrativos
router.patch('/:id/status', [verifyToken], updateWorkOrderStatus)
router.post('/:id/products', [verifyToken], addProductToOrder)

export default router

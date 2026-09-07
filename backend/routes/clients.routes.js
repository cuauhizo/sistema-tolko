import { Router } from 'express'
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clients.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Todas las rutas requieren que el usuario haya iniciado sesión
router.use(verifyToken)

router.get('/', getClients)

// Rutas estáticas protegidas con sus permisos específicos
router.post('/', hasPermission('create_clients'), createClient)

// Rutas dinámicas (por ID) protegidas con sus permisos específicos
router.get('/:id', hasPermission('read_clients'), getClientById)
router.put('/:id', hasPermission('update_clients'), updateClient)
router.delete('/:id', hasPermission('delete_clients'), deleteClient)

export default router

import { Router } from 'express'
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clients.controller.js'
import { verifyToken, isAdmin } from '../middlewares/authJwt.js'

const router = Router()

// Todas las rutas requieren que el usuario haya iniciado sesión
router.use(verifyToken)

// Rutas estáticas
router.get('/', getClients)
router.post('/', createClient)

// Rutas dinámicas (por ID)
router.get('/:id', getClientById)
// Solo un administrador puede editar o borrar clientes
router.put('/:id', isAdmin, updateClient)
router.delete('/:id', isAdmin, deleteClient)

export default router

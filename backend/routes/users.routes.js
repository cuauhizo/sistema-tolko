import { Router } from 'express'
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../controllers/users.controller.js'
// 1. Cambiamos hasRole por hasPermission
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Cualquier usuario con un token válido puede cambiar su propia contraseña
router.post('/change-password', [verifyToken], changePassword)

// Permitir lectura a todos los usuarios autenticados para que puedan asignar tareas.
router.get('/', [verifyToken], getUsers)

// 2. Cambiamos hasRole(['superadmin']) por el permiso granular correspondiente
router.post('/', [verifyToken, hasPermission('manage_users')], createUser)
router.put('/:id', [verifyToken, hasPermission('manage_users')], updateUser)
router.delete('/:id', [verifyToken, hasPermission('manage_users')], deleteUser)

export default router

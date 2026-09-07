import { Router } from 'express'
import * as rolesController from '../controllers/roles.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Protegemos TODAS las rutas: Debes tener sesión y tener el permiso de gestión total
// (Opcionalmente puedes usar hasRole(['superadmin']) aquí también)
router.use([verifyToken, hasPermission('manage_users')])

// Rutas base
router.get('/', rolesController.getRoles)
router.get('/permissions', rolesController.getPermissions)

// Rutas específicas por Rol
router.get('/:id/permissions', rolesController.getRolePermissions)
router.post('/:id/permissions', rolesController.updateRolePermissions)

export default router

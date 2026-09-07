import { Router } from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// Protegemos cada ruta con su permiso granular correspondiente
router.get('/', [verifyToken, hasPermission('read_categories')], getCategories)
router.post('/', [verifyToken, hasPermission('create_categories')], createCategory)
router.put('/:id', [verifyToken, hasPermission('update_categories')], updateCategory)
router.delete('/:id', [verifyToken, hasPermission('delete_categories')], deleteCategory)

export default router

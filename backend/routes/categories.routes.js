import { Router } from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categories.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

router.get('/', verifyToken, getCategories)

// Protegemos cada ruta con su permiso granular correspondiente
router.post('/', [verifyToken, hasPermission('create_categories')], createCategory)
router.put('/:id', [verifyToken, hasPermission('update_categories')], updateCategory)
router.delete('/:id', [verifyToken, hasPermission('delete_categories')], deleteCategory)

export default router

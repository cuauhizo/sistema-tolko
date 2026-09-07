import { Router } from 'express'
import { getTasks, getMyTasks, createTask, updateTaskStatus, updateTask, deleteTask } from '../controllers/tasks.controller.js'
import { verifyToken, hasPermission } from '../middlewares/authJwt.js'

const router = Router()

// --- Rutas de Gestión (Requieren permisos específicos) ---
// Usamos los permisos de 'tasks' que creamos en la base de datos
router.get('/', [verifyToken, hasPermission('read_tasks')], getTasks)
router.post('/', [verifyToken, hasPermission('create_tasks')], createTask)
router.put('/:id', [verifyToken, hasPermission('update_tasks')], updateTask)
router.delete('/:id', [verifyToken, hasPermission('delete_tasks')], deleteTask)

// --- Rutas Operativas (Para cualquier usuario logueado) ---
// Cualquier usuario logueado puede ver las tareas que se le asignaron
router.get('/mytasks', [verifyToken], getMyTasks)
// Cualquier usuario logueado puede actualizar el estado (ej. "completada") de su tarea
router.patch('/:id/status', [verifyToken], updateTaskStatus)

export default router

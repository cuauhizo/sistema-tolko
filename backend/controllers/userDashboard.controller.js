import { pool } from '../config/db.js';

export const getUserDashboardStats = async (req, res) => {
  const userId = req.userId; // Obtenemos el ID del token (gracias a verifyToken)

  try {
    // 1. Contar tareas pendientes o en progreso asignadas al usuario
    const [activeTasksResult] = await pool.query(
      "SELECT COUNT(id) as total FROM tasks WHERE assigned_to_id = ? AND status IN ('pendiente', 'en_progreso')",
      [userId]
    );

    // 2. Contar órdenes de trabajo pendientes o en progreso asignadas al usuario
    const [activeWorkOrdersResult] = await pool.query(
      "SELECT COUNT(id) as total FROM work_orders WHERE assigned_to_id = ? AND status IN ('pendiente', 'en_progreso')",
      [userId]
    );

    const stats = {
      activeTasks: activeTasksResult[0].total || 0,
      activeWorkOrders: activeWorkOrdersResult[0].total || 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener las estadísticas del usuario:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

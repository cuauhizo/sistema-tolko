import { pool } from '../config/db.js';

// ADMIN: Asignar una nueva tarea
export const createTask = async (req, res) => {
  const { title, description, due_date, assigned_to_id } = req.body;
  const assigned_by_id = req.userId; // El asignador es el admin que está logueado

  if (!title || !assigned_to_id) {
    return res.status(400).json({ message: 'El título y el usuario asignado son requeridos.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, due_date, assigned_to_id, assigned_by_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, due_date, assigned_to_id, assigned_by_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ADMIN: Obtener todas las tareas de todos los usuarios
export const getTasks = async (req, res) => {
  try {
    // Leemos los parámetros 'page' y 'limit' de la URL. Si no vienen, usamos valores por defecto.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Primero, contamos el total de tareas para la paginación
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM tasks');
    const totalTasks = totalRows[0].total;

    
    const query = `
            SELECT 
            t.id, t.title, t.description, t.status, t.due_date, t.assigned_to_id,
            assignee.username as assigned_to,
            assigner.username as assigned_by
        FROM tasks t
        JOIN users assignee ON t.assigned_to_id = assignee.id
        JOIN users assigner ON t.assigned_by_id = assigner.id
        ORDER BY t.request_date DESC
        LIMIT ? OFFSET ?
        `;

    const [tasks] = await pool.query(query, [limit, offset]);
    res.status(200).json({
      data: tasks,
      pagination: {
        total: totalTasks,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
    })
    // const [tasks] = await pool.query(query);
    // res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener todas las tareas:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ADMIN: Actualizar cualquier tarea
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, assigned_to_id, status } = req.body;

  if (!title || !assigned_to_id || !status) {
    return res.status(400).json({ message: 'Título, usuario asignado y estado son requeridos.' });
  }

  try {
    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, due_date = ?, assigned_to_id = ?, status = ? WHERE id = ?',
      [title, description, due_date, assigned_to_id, status, id]
    );

    // --- CORRECCIÓN 2: Devolvemos el objeto completo con JOINs ---
    const updatedTaskQuery = `
        SELECT 
            t.id, t.title, t.description, t.status, t.due_date, t.assigned_to_id,
            assignee.username as assigned_to,
            assigner.username as assigned_by
        FROM tasks t
        JOIN users assignee ON t.assigned_to_id = assignee.id
        JOIN users assigner ON t.assigned_by_id = assigner.id
        WHERE t.id = ?
    `;
    const [updatedTaskRows] = await pool.query(updatedTaskQuery, [id]);

    if (updatedTaskRows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    res.status(200).json(updatedTaskRows[0]);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};
// ADMIN: Eliminar cualquier tarea
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// USUARIO: Obtener solo las tareas asignadas al usuario actual
export const old_getMyTasks = async (req, res) => {
  try {
    // Obtenemos el ID del usuario del token que ya fue verificado por el middleware
    const userId = req.userId;
    const query = `
            SELECT t.id, t.title, t.description, t.status, t.due_date, u.username as assigned_by
            FROM tasks t
            JOIN users u ON t.assigned_by_id = u.id
            WHERE t.assigned_to_id = ?
            ORDER BY t.due_date ASC
        `;
    const [tasks] = await pool.query(query, [userId]);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener mis tareas:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// USUARIO: Obtener solo las tareas asignadas al usuario actual
export const getMyTasks = async (req, res) => {
    try {
        const userId = req.userId;
        const status = req.query.status; // Leemos el filtro de estado de la URL

        let query = `
            SELECT t.id, t.title, t.description, t.status, t.due_date, u.username as assigned_by
            FROM tasks t
            JOIN users u ON t.assigned_by_id = u.id
            WHERE t.assigned_to_id = ?
        `;
        const params = [userId];

        // Si se proporciona un filtro de estado, lo añadimos a la consulta
        if (status && ['pendiente', 'en_progreso', 'completada'].includes(status)) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        query += ' ORDER BY t.due_date ASC';

        const [tasks] = await pool.query(query, params);
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error al obtener mis tareas:", error);
        return res.status(500).json({ message: 'Algo salió mal' });
    }
};

// USUARIO: Actualizar el estado de una de sus tareas
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.userId;

  if (!status || !['pendiente', 'en_progreso', 'completada'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido.' });
  }

  try {
    // Verificamos que la tarea pertenezca al usuario para evitar que actualice tareas ajenas
    const [result] = await pool.query('UPDATE tasks SET status = ? WHERE id = ? AND assigned_to_id = ?', [
      status,
      id,
      userId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada o no tienes permiso para actualizarla.' });
    }
    res.status(200).json({ message: 'Estado de la tarea actualizado.' });
  } catch (error) {
    console.error('Error al actualizar estado de la tarea:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

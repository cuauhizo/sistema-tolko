import { pool } from '../config/db.js'
import transporter from '../config/mailer.js'
import { formatStatus, formatTaskId } from '../utils/formatters.js'
import { io } from '../index.js'

// ADMIN: Asignar una nueva tarea
export const createTask = async (req, res) => {
  const { title, description, due_date, assigned_to_id } = req.body
  const assigned_by_id = req.userId

  if (!title || !assigned_to_id) {
    return res.status(400).json({ message: 'El título y el usuario asignado son requeridos.' })
  }

  try {
    // --- 1. Guardar la tarea en la base de datos ---
    const [result] = await pool.query('INSERT INTO tasks (title, description, due_date, assigned_to_id, assigned_by_id) VALUES (?, ?, ?, ?, ?)', [title, description, due_date, assigned_to_id, assigned_by_id])

    const taskId = result.insertId
    // --- 2. Guardar la notificación en la base de datos ---
    const notificationMessage = `Nueva tarea (${formatTaskId(taskId)}) asignada: "${title}"`
    await pool.query('INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)', [assigned_to_id, notificationMessage, `/my-tasks`])

    // --- WEBSOCKETS (Paso 2) ---
    // Emitimos el evento en tiempo real.
    // Usamos el ID del usuario como nombre de la "sala" (room) para que sea un mensaje privado.
    // (Asegúrate de que en el Frontend, cuando el usuario inicie sesión, se una a esta sala).
    io.to(`user-${assigned_to_id}`).emit('new-notification', {
      message: notificationMessage,
      taskId: taskId,
      title: title,
    })
    // Si aún no implementas "rooms" en el frontend, puedes usar un broadcast global por ahora:
    // io.emit('new-notification', { message: notificationMessage, userId: assigned_to_id });

    // --- 3. Enviar la notificación por correo electrónico ---
    try {
      const [users] = await pool.query('SELECT email, username FROM users WHERE id = ?', [assigned_to_id])
      if (users.length > 0) {
        const user = users[0]

        await transporter.sendMail({
          from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Nueva Tarea Asignada (${formatTaskId(taskId)}) - Sistema Tolko`,
          html: `
            <h2>Hola ${user.username},</h2>
            <p>Un administrador te ha asignado una nueva tarea en el Sistema Tolko:</p>
            <br>
            <h3>${title}</h3>
            <p><strong>Descripción:</strong> ${description || 'Sin descripción.'}</p>
            <p><strong>Fecha de entrega:</strong> ${new Date(due_date).toLocaleDateString()}</p>
            <br>
            <p>Puedes ver los detalles iniciando sesión en la plataforma.</p>
          `,
        })
      }
    } catch (emailError) {
      console.error('AVISO: La tarea se creó, pero falló el envío del correo de notificación:', emailError)
    }

    // --- 4. Enviar respuesta exitosa ---
    res.status(201).json({ id: result.insertId, ...req.body })
  } catch (error) {
    console.error('Error al crear la tarea:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// ADMIN: Obtener todas las tareas de todos los usuarios
export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM tasks')
    const totalTasks = totalRows[0].total

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
        `

    const [tasks] = await pool.query(query, [limit, offset])
    res.status(200).json({
      data: tasks,
      pagination: {
        total: totalTasks,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalTasks / limit),
      },
    })
  } catch (error) {
    console.error('Error al obtener todas las tareas:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// ADMIN: Actualizar cualquier tarea
export const updateTask = async (req, res) => {
  const { id } = req.params
  const { title, description, due_date, assigned_to_id, status } = req.body

  if (!title || !assigned_to_id || !status) {
    return res.status(400).json({ message: 'Título, usuario asignado y estado son requeridos.' })
  }

  try {
    await pool.query('UPDATE tasks SET title = ?, description = ?, due_date = ?, assigned_to_id = ?, status = ? WHERE id = ?', [title, description, due_date, assigned_to_id, status, id])

    // Notificacion
    const notificationMessageUpdate = `La tarea "${title}" (${formatTaskId(id)}) que tienes asignada ha sido actualizada.`
    await pool.query('INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)', [assigned_to_id, notificationMessageUpdate, `/my-tasks`])

    // --- WEBSOCKETS (Paso 3) ---
    // Avisar al usuario que su tarea fue actualizada
    io.to(`user-${assigned_to_id}`).emit('new-notification', {
      message: notificationMessageUpdate,
      taskId: id,
      type: 'update',
    })

    // --- Enviar la notificación por correo electrónico ---
    try {
      const [users] = await pool.query('SELECT email, username FROM users WHERE id = ?', [assigned_to_id])
      if (users.length > 0) {
        const user = users[0]

        await transporter.sendMail({
          from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Tarea Actualizada (${formatTaskId(id)}) - Sistema Tolko`,
          html: `
            <h2>Hola ${user.username},</h2>
            <p>Se ha actualizado una tarea que tienes asignada en el Sistema Tolko:</p>
            <br>
            <h3>${title} - (${formatTaskId(id)})</h3>
            <p><strong>Nuevo estado:</strong> ${formatStatus(status)}</p>
            <p><strong>Descripción:</strong> ${description || 'Sin descripción.'}</p>
            <p><strong>Fecha de entrega:</strong> ${new Date(due_date).toLocaleDateString()}</p>
            <br>
            <p>Puedes ver los detalles completos iniciando sesión en la plataforma.</p>
          `,
        })
      }
    } catch (emailError) {
      console.error('AVISO: La tarea se actualizó, pero falló el envío del correo de notificación:', emailError)
    }

    // --- Devolver la tarea actualizada como respuesta ---
    const updatedTaskQuery = `
        SELECT
            t.id, t.title, t.description, t.status, t.due_date, t.assigned_to_id,
            assignee.username as assigned_to,
            assigner.username as assigned_by
        FROM tasks t
        JOIN users assignee ON t.assigned_to_id = assignee.id
        JOIN users assigner ON t.assigned_by_id = assigner.id
        WHERE t.id = ?
    `
    const [updatedTaskRows] = await pool.query(updatedTaskQuery, [id])

    if (updatedTaskRows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' })
    }

    res.status(200).json(updatedTaskRows[0])
  } catch (error) {
    console.error('Error al actualizar la tarea:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// ADMIN: Eliminar cualquier tarea
export const deleteTask = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' })
    }

    // Opcional: Emitir por WebSockets si el dashboard de los admins necesita refrescarse
    // io.to('admins').emit('task-deleted', { taskId: id });

    res.sendStatus(204)
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// USUARIO: Obtener solo las tareas asignadas al usuario actual
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.userId
    const status = req.query.status

    let query = `
            SELECT t.id, t.title, t.description, t.status, t.due_date, u.username as assigned_by
            FROM tasks t
            JOIN users u ON t.assigned_by_id = u.id
            WHERE t.assigned_to_id = ?
        `
    const params = [userId]

    if (status && ['pendiente', 'en_progreso', 'completada'].includes(status)) {
      query += ' AND t.status = ?'
      params.push(status)
    }

    query += ' ORDER BY t.due_date DESC'

    const [tasks] = await pool.query(query, params)
    res.status(200).json(tasks)
  } catch (error) {
    console.error('Error al obtener mis tareas:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// USUARIO: Actualizar el estado de una de sus tareas
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const userId = req.userId

  if (!status || !['pendiente', 'en_progreso', 'completada'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.query('UPDATE tasks SET status = ? WHERE id = ? AND assigned_to_id = ?', [status, id, userId])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Tarea no encontrada o no tienes permiso para actualizarla.' })
    }

    // --- INICIO DE LA LÓGICA DE NOTIFICACIÓN A ADMINS ---
    const [taskData] = await connection.query('SELECT title FROM tasks WHERE id = ?', [id])
    const [userData] = await connection.query('SELECT username FROM users WHERE id = ?', [userId])
    const taskTitle = taskData[0]?.title || 'N/A'
    const userName = userData[0]?.username || 'Usuario'

    const [allAdmins] = await connection.query('SELECT id, email, username FROM users WHERE role_id = 1')
    const adminsToNotify = allAdmins.filter(admin => admin.id !== userId)

    if (adminsToNotify.length > 0) {
      const notificationMessage = `El usuario ${userName} actualizó la tarea "${taskTitle}" (${formatTaskId(id)}) al estado: ${formatStatus(status)}.`
      const notificationLink = '/tasks'

      const notificationsData = adminsToNotify.map(admin => [admin.id, notificationMessage, notificationLink])
      await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

      // --- WEBSOCKETS (Paso 4) ---
      // Emitimos un evento a todos los admins
      // (En el frontend, los administradores se unirían a la sala 'admins')
      io.to('admins').emit('new-notification', {
        message: notificationMessage,
        type: 'task-status-changed',
      })

      // 5. Enviar notificaciones por correo
      for (const admin of adminsToNotify) {
        try {
          await transporter.sendMail({
            from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
            to: admin.email,
            subject: `Actualización de Tarea (${formatTaskId(id)})`,
            html: `
              <h2>Hola ${admin.username},</h2>
              <p>El usuario <strong>${userName}</strong> ha actualizado el estado de una tarea.</p>
              <br>
              <h3>${formatTaskId(id)}: ${taskTitle}</h3>
              <p><strong>Nuevo estado:</strong> ${formatStatus(status)}</p>
              <br>
              <p>Puedes revisar el tablero de tareas en la plataforma.</p>
            `,
          })
        } catch (emailError) {
          console.error(`AVISO: Falló el correo para el admin ${admin.id}:`, emailError)
        }
      }
    }

    await connection.commit()
    res.status(200).json({ message: 'Estado de la tarea actualizado.' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al actualizar estado de la tarea:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  } finally {
    connection.release()
  }
}

import { pool } from '../config/db.js'
import transporter from '../config/mailer.js'
import { formatStatus, formatWorkOrderId } from '../utils/formatters.js'
import { io } from '../index.js'

// ADMIN: Crear una nueva orden de trabajo
export const createWorkOrder = async (req, res) => {
  const { title, description, client_id, design_link, width, height, assigned_to_ids, start_date, end_date, products } = req.body
  const created_by_id = req.userId

  if (!title || !assigned_to_ids || assigned_to_ids.length === 0) {
    return res.status(400).json({ message: 'El título y al menos un usuario asignado son requeridos.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.query('INSERT INTO work_orders (title, description, client_id, design_link, width, height, created_by_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      title,
      description,
      client_id || null,
      design_link || null,
      width ? parseFloat(width) : null,
      height ? parseFloat(height) : null,
      created_by_id,
      start_date,
      end_date,
    ])
    const workOrderId = result.insertId
    const workOrderFolio = `OT-${String(workOrderId).padStart(4, '0')}`

    const assigneeValues = assigned_to_ids.map(userId => [workOrderId, userId])
    await connection.query('INSERT INTO work_order_assignees (work_order_id, user_id) VALUES ?', [assigneeValues])

    if (products && products.length > 0) {
      const productValues = products.map(p => [workOrderId, p.product_id, p.quantity_used])
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [productValues])
    }

    const [users] = await connection.query('SELECT id, email, username FROM users WHERE id IN (?)', [assigned_to_ids])

    if (users.length > 0) {
      let clientNameDisplay = 'Público General'
      if (client_id) {
        const [clientData] = await connection.query('SELECT name FROM clients WHERE id = ?', [client_id])
        if (clientData.length > 0) clientNameDisplay = clientData[0].name
      }

      const notificationMessage = `Nueva orden de trabajo asignada: "${title}"`
      const notificationsData = users.map(user => [user.id, notificationMessage, '/my-work-orders'])
      await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

      users.forEach(user => {
        io.to(`user-${user.id}`).emit('new-notification', { message: notificationMessage, workOrderId })
      })

      for (const user of users) {
        try {
          await transporter.sendMail({
            from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Nueva Orden de Trabajo Asignada (${workOrderFolio}) - Sistema Tolko`,
            html: `
                <h2>Hola ${user.username},</h2>
                <p>Se te ha asignado una nueva orden de trabajo: "${title}".</p>
                <p><strong>Cliente:</strong> ${clientNameDisplay}</p>
                <p><strong>Fecha límite:</strong> ${new Date(end_date).toLocaleDateString()}</p>
                <br>
                <p>Puedes ver los detalles completos iniciando sesión en la plataforma.</p>
                `,
          })
        } catch (emailError) {
          console.error(`AVISO: Falló el envío del correo para el usuario ${user.id}:`, emailError)
        }
      }
    }

    await connection.commit()
    res.status(201).json({ id: workOrderId, message: 'Orden creada con éxito' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al crear la orden de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal al crear la orden' })
  } finally {
    connection.release()
  }
}

// ADMIN: Obtener todas las órdenes de trabajo (SOLO ACTIVAS)
export const getWorkOrders = async (req, res) => {
  try {
    const query = `
      SELECT 
          wo.id, wo.title, wo.status, wo.end_date,
          COALESCE(c.name, wo.client_name) as client_name,
          GROUP_CONCAT(assignee.username SEPARATOR ', ') as assigned_to,
          creator.username as created_by
      FROM work_orders wo
      LEFT JOIN clients c ON wo.client_id = c.id
      LEFT JOIN work_order_assignees woa ON wo.id = woa.work_order_id
      LEFT JOIN users assignee ON woa.user_id = assignee.id
      JOIN users creator ON wo.created_by_id = creator.id
      WHERE wo.is_active = 1
      GROUP BY wo.id
      ORDER BY wo.created_at DESC
    `
    const [orders] = await pool.query(query)
    res.status(200).json(orders)
  } catch (error) {
    console.error('Error al obtener las órdenes de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// ADMIN: Actualizar una orden de trabajo
export const updateWorkOrder = async (req, res) => {
  const { id } = req.params
  const { title, description, client_id, design_link, width, height, assigned_to_ids, start_date, end_date, status, products } = req.body

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [currentOrder] = await connection.query('SELECT status FROM work_orders WHERE id = ? AND is_active = 1', [id])
    if (currentOrder.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Orden no encontrada o eliminada' })
    }
    const oldStatus = currentOrder[0].status

    await connection.query('UPDATE work_orders SET title = ?, description = ?, client_id = ?, design_link = ?, width = ?, height = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?', [
      title,
      description,
      client_id || null,
      design_link || null,
      width ? parseFloat(width) : null,
      height ? parseFloat(height) : null,
      start_date,
      end_date,
      status,
      id,
    ])

    await connection.query('DELETE FROM work_order_assignees WHERE work_order_id = ?', [id])
    if (assigned_to_ids && assigned_to_ids.length > 0) {
      const assigneeValues = assigned_to_ids.map(userId => [id, userId])
      await connection.query('INSERT INTO work_order_assignees (work_order_id, user_id) VALUES ?', [assigneeValues])
    }

    await connection.query('DELETE FROM work_order_products WHERE work_order_id = ?', [id])
    if (products && products.length > 0) {
      const productValues = products.map(p => [id, p.product_id, p.quantity_used])
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [productValues])
    }

    if (status === 'completada' && oldStatus !== 'completada') {
      if (products && products.length > 0) {
        for (const product of products) {
          await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [parseFloat(product.quantity_used), product.product_id])
          await connection.query(`INSERT INTO inventory_movements (product_id, work_order_id, movement_type, user_id, quantity_change, reason) VALUES (?, ?, 'SALIDA', ?, ?, ?)`, [
            product.product_id,
            id,
            req.userId,
            -parseFloat(product.quantity_used),
            `Salida por Orden de Trabajo #${formatWorkOrderId(id)}`,
          ])
        }
      }
    }

    if (assigned_to_ids && assigned_to_ids.length > 0) {
      const [users] = await connection.query('SELECT id, email, username FROM users WHERE id IN (?)', [assigned_to_ids])

      if (users.length > 0) {
        const workOrderFolio = `OT-${String(id).padStart(4, '0')}`
        const notificationMessageUpdate = `La orden "${title}" (${workOrderFolio}) ha sido actualizada.`

        const notificationsData = users.map(user => [user.id, notificationMessageUpdate, '/my-work-orders'])
        await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

        users.forEach(user => {
          io.to(`user-${user.id}`).emit('new-notification', { message: notificationMessageUpdate, workOrderId: id })
        })

        for (const user of users) {
          try {
            await transporter.sendMail({
              from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject: `Orden de Trabajo Actualizada (${workOrderFolio}) - Sistema Tolko`,
              html: `<h2>Hola ${user.username},</h2><p>Se ha actualizado una orden que tienes asignada: "${title}".</p><p><strong>Nuevo estado:</strong> ${formatStatus(status)}</p><p>Por favor, revisa los detalles en la plataforma.</p>`,
            })
          } catch (emailError) {
            console.error(`AVISO: Falló el envío del correo de actualización para el usuario ${user.id}:`, emailError)
          }
        }
      }
    }

    await connection.commit()
    res.status(200).json({ message: 'Orden de trabajo actualizada correctamente' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al actualizar la orden:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  } finally {
    connection.release()
  }
}

// OBTENER una orden de trabajo por su ID (SOLO ACTIVAS)
export const getWorkOrderById = async (req, res) => {
  const { id } = req.params
  try {
    const orderQuery = `
      SELECT 
          wo.id, wo.title, wo.description, wo.status, 
          wo.client_id, wo.design_link, wo.width, wo.height,
          COALESCE(c.name, wo.client_name) as client_name, 
          wo.start_date, wo.end_date,
          creator.username as created_by
      FROM work_orders wo
      LEFT JOIN clients c ON wo.client_id = c.id
      JOIN users creator ON wo.created_by_id = creator.id
      WHERE wo.id = ? AND wo.is_active = 1
    `
    const [orders] = await pool.query(orderQuery, [id])

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Orden de trabajo no encontrada o eliminada.' })
    }
    const workOrder = orders[0]

    const assigneesQuery = `SELECT u.id, u.username FROM users u JOIN work_order_assignees woa ON u.id = woa.user_id WHERE woa.work_order_id = ?`
    const [assignees] = await pool.query(assigneesQuery, [id])
    workOrder.assigned_to_ids = assignees.map(a => a.id)
    workOrder.assigned_to = assignees.map(a => a.username).join(', ')

    const productsQuery = `
      SELECT p.id as product_id, p.name, wop.quantity_used
      FROM work_order_products wop
      JOIN products p ON wop.product_id = p.id
      WHERE wop.work_order_id = ?
    `
    const [products] = await pool.query(productsQuery, [id])
    workOrder.products = products

    res.status(200).json(workOrder)
  } catch (error) {
    console.error('Error al obtener la orden de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// ADMIN: Eliminar una orden de trabajo (AHORA ES SOFT DELETE)
export const deleteWorkOrder = async (req, res) => {
  const { id } = req.params
  try {
    // Ya no borramos nada físicamente, solo la "apagamos"
    const [result] = await pool.query('UPDATE work_orders SET is_active = 0 WHERE id = ?', [id])

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Orden no encontrada' })

    res.sendStatus(204)
  } catch (error) {
    console.error('Error al eliminar (soft delete) la orden:', error)
    res.status(500).json({ message: 'Error al eliminar la orden' })
  }
}

// USUARIO: Obtener solo las órdenes asignadas (SOLO ACTIVAS)
export const getMyWorkOrders = async (req, res) => {
  try {
    const userId = req.userId
    const status = req.query.status

    let query = `
      SELECT 
          wo.id, wo.title, wo.status, wo.end_date,
          COALESCE(c.name, wo.client_name) as client_name,
          GROUP_CONCAT(assignee.username SEPARATOR ', ') as assigned_to,
          creator.username as created_by
      FROM work_orders wo
      LEFT JOIN clients c ON wo.client_id = c.id
      JOIN work_order_assignees woa ON wo.id = woa.work_order_id
      LEFT JOIN users assignee ON woa.user_id = assignee.id
      JOIN users creator ON wo.created_by_id = creator.id
      WHERE woa.user_id = ? AND wo.is_active = 1
    `
    const params = [userId]

    if (status && ['pendiente', 'en_progreso', 'por_aprobar', 'completada', 'cancelada'].includes(status)) {
      query += ' AND wo.status = ?'
      params.push(status)
    }

    query += ' GROUP BY wo.id ORDER BY wo.end_date DESC'

    const [orders] = await pool.query(query, params)
    res.status(200).json(orders)
  } catch (error) {
    console.error('Error al obtener mis órdenes de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// USUARIO: Actualizar el estado de una de sus órdenes de trabajo
export const updateWorkOrderStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const userId = req.userId

  if (!status || !['pendiente', 'en_progreso', 'por_aprobar'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.query(`UPDATE work_orders SET status = ? WHERE id = ? AND is_active = 1 AND EXISTS (SELECT 1 FROM work_order_assignees WHERE work_order_id = ? AND user_id = ? )`, [status, id, id, userId])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Orden no encontrada o no tienes permiso para actualizarla.' })
    }

    if (status === 'por_aprobar') {
      const [orderData] = await connection.query('SELECT wo.title, COALESCE(c.name, wo.client_name) as client_name FROM work_orders wo LEFT JOIN clients c ON wo.client_id = c.id WHERE wo.id = ?', [id])
      const orderTitle = orderData[0]?.title || 'N/A'
      const clientName = orderData[0]?.client_name || 'N/A'
      const workOrderFolio = `OT-${String(id).padStart(4, '0')}`

      const [allAdmins] = await connection.query('SELECT id, email, username FROM users WHERE role_id = 1')
      const adminsToNotify = allAdmins.filter(admin => admin.id !== userId)

      if (adminsToNotify.length > 0) {
        const notificationMessage = `La orden "${orderTitle}" (${workOrderFolio}) requiere aprobación.`
        const notificationsData = adminsToNotify.map(admin => [admin.id, notificationMessage, '/work-orders'])
        await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

        io.to('admins').emit('new-notification', { message: notificationMessage })

        try {
          for (const admin of adminsToNotify) {
            await transporter.sendMail({
              from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
              to: admin.email,
              subject: `Revisión Requerida: Orden de Trabajo ${workOrderFolio}`,
              html: `
                    <h2>Hola ${admin.username},</h2>
                    <p>Una orden de trabajo ha sido marcada como finalizada y requiere tu aprobación.</p>
                    <br>
                    <h3>${workOrderFolio}: ${orderTitle}</h3>
                    <p><strong>Cliente:</strong> ${clientName}</p>
                    <br>
                    <p>Por favor, inicia sesión en el sistema para revisarla y cambiar su estado a "Completada".</p>
                    <a href="${process.env.FRONTEND_URL}/work-orders">Ir a Órdenes de Trabajo</a>
                `,
            })
          }
        } catch (emailError) {
          console.error('AVISO: Falló el envío de correos a los admins:', emailError)
        }
      }
    }

    await connection.commit()
    res.status(200).json({ message: 'Estado de la orden actualizado.' })
  } catch (error) {
    await connection.rollback()
    console.error('Error al actualizar estado de la orden:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  } finally {
    connection.release()
  }
}

// AGREGAR producto a la orden
export const addProductToOrder = async (req, res) => {
  const { id } = req.params
  const { product_id, quantity_used } = req.body
  try {
    await pool.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES (?, ?, ?)', [id, product_id, parseFloat(quantity_used)])
    res.status(201).json({ message: 'Producto agregado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar producto a la orden' })
  }
}

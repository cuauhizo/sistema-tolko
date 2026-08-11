import { pool } from '../config/db.js'
import transporter from '../config/mailer.js'
import { formatStatus, formatWorkOrderId } from '../utils/formatters.js'

// --- WEBSOCKETS (Paso 1: Importar la instancia) ---
import { io } from '../index.js'

// ADMIN: Crear una nueva orden de trabajo para múltiples usuarios
export const createWorkOrder = async (req, res) => {
  const { title, description, client_name, assigned_to_ids, start_date, end_date, products } = req.body
  const created_by_id = req.userId

  if (!title || !assigned_to_ids || assigned_to_ids.length === 0) {
    return res.status(400).json({ message: 'El título y al menos un usuario asignado son requeridos.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Insertar la orden principal (sin assigned_to_id)
    const [result] = await connection.query('INSERT INTO work_orders (title, description, client_name, created_by_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)', [title, description, client_name, created_by_id, start_date, end_date])
    const workOrderId = result.insertId
    const workOrderFolio = `OT-${String(workOrderId).padStart(4, '0')}`

    // 2. Insertar las asignaciones en la nueva tabla work_order_assignees
    const assigneeValues = assigned_to_ids.map(userId => [workOrderId, userId])
    await connection.query('INSERT INTO work_order_assignees (work_order_id, user_id) VALUES ?', [assigneeValues])

    // Lógica para insertar productos (sin cambios)
    if (products && products.length > 0) {
      const productValues = products.map(p => [workOrderId, p.product_id, p.quantity_used])
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [productValues])
    }

    // 3. Notificar a TODOS los usuarios asignados
    const [users] = await connection.query('SELECT id, email, username FROM users WHERE id IN (?)', [assigned_to_ids])

    if (users.length > 0) {
      const notificationMessage = `Nueva orden de trabajo asignada: "${title}"`
      const notificationsData = users.map(user => [user.id, notificationMessage, '/my-work-orders'])
      await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

      // --- WEBSOCKETS (Paso 2: Emitir a múltiples usuarios) ---
      users.forEach(user => {
        io.to(`user-${user.id}`).emit('new-notification', {
          message: notificationMessage,
          workOrderId: workOrderId,
        })
      })

      // Enviar correos a cada usuario asignado
      for (const user of users) {
        try {
          await transporter.sendMail({
            from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Nueva Orden de Trabajo Asignada (${workOrderFolio}) - Sistema Tolko`,
            html: `
                <h2>Hola ${user.username},</h2>
                <p>Se te ha asignado una nueva orden de trabajo: "${title}".</p>
                <p><strong>Cliente:</strong> ${client_name || 'N/A'}</p>
                <p><strong>Fecha de finalización:</strong> ${new Date(end_date).toLocaleDateString()}</p>
                <br>
                <p>Puedes ver los detalles completos iniciando sesión en la plataforma.</p>
                `,
          })
        } catch (emailError) {
          console.error(`AVISO: Falló el envío del correo de notificación para el usuario ${user.id}:`, emailError)
        }
      }
    }

    await connection.commit()
    res.status(201).json({ id: workOrderId, ...req.body })
  } catch (error) {
    await connection.rollback()
    console.error('Error al crear la orden de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  } finally {
    connection.release()
  }
}

// ADMIN: Obtener todas las órdenes de trabajo
export const getWorkOrders = async (req, res) => {
  try {
    const query = `
      SELECT 
          wo.id, wo.title, wo.status, wo.client_name, wo.end_date,
          GROUP_CONCAT(assignee.username SEPARATOR ', ') as assigned_to,
          creator.username as created_by
      FROM work_orders wo
      LEFT JOIN work_order_assignees woa ON wo.id = woa.work_order_id
      LEFT JOIN users assignee ON woa.user_id = assignee.id
      JOIN users creator ON wo.created_by_id = creator.id
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
  const { title, description, client_name, assigned_to_ids, start_date, end_date, status, products } = req.body

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Obtener el estado anterior de la orden
    const [currentOrder] = await connection.query('SELECT status FROM work_orders WHERE id = ?', [id])
    const oldStatus = currentOrder[0]?.status

    await connection.query('UPDATE work_orders SET title = ?, description = ?, client_name = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?', [title, description, client_name, start_date, end_date, status, id])

    // Actualizar asignaciones: borrar las viejas e insertar las nuevas
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

    // --- LÓGICA DE INVENTARIO ---
    if (status === 'completada' && oldStatus !== 'completada') {
      if (products && products.length > 0) {
        for (const product of products) {
          // Restar el stock del producto
          await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [product.quantity_used, product.product_id])
          await connection.query(
            `INSERT INTO inventory_movements 
            (product_id, work_order_id, movement_type, user_id, quantity_change, reason) 
            VALUES (?, ?, 'SALIDA', ?, ?, ?)`,
            [product.product_id, id, req.userId, -product.quantity_used, `Salida por Orden de Trabajo #${formatWorkOrderId(id)}`],
          )
        }
      }
    }
    // --- FIN DE LÓGICA DE INVENTARIO ---

    // --- INICIO DE LA LÓGICA DE NOTIFICACIÓN CORREGIDA ---
    if (assigned_to_ids && assigned_to_ids.length > 0) {
      // 1. Obtener los datos de todos los usuarios asignados
      const [users] = await connection.query('SELECT id, email, username FROM users WHERE id IN (?)', [assigned_to_ids])

      if (users.length > 0) {
        const workOrderFolio = `OT-${String(id).padStart(4, '0')}`
        const notificationMessageUpdate = `La orden "${title}" (${workOrderFolio}) ha sido actualizada.`

        // 2. Preparar los datos para una inserción múltiple de notificaciones en la app
        const notificationsData = users.map(user => [user.id, notificationMessageUpdate, '/my-work-orders'])
        await connection.query('INSERT INTO notifications (user_id, message, link) VALUES ?', [notificationsData])

        // --- WEBSOCKETS (Paso 3: Emitir a los usuarios al actualizar) ---
        users.forEach(user => {
          io.to(`user-${user.id}`).emit('new-notification', {
            message: notificationMessageUpdate,
            workOrderId: id,
          })
        })

        // 3. Recorrer los usuarios para enviar un correo a cada uno
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
    // --- FIN DE LA LÓGICA DE NOTIFICACIÓN CORREGIDA ---

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

// ADMIN: Eliminar una orden de trabajo
export const deleteWorkOrder = async (req, res) => {
  const { id } = req.params
  const connection = await pool.getConnection() // Obtener una conexión del pool

  try {
    // 1. Iniciar una transacción
    await connection.beginTransaction()

    // 2. Eliminar los registros de productos asociados a la orden
    await connection.query('DELETE FROM work_order_products WHERE work_order_id = ?', [id])

    // 3. Eliminar la orden de trabajo principal
    const [result] = await connection.query('DELETE FROM work_orders WHERE id = ?', [id])

    // 4. Si no se afectó ninguna fila, la orden no existía
    if (result.affectedRows === 0) {
      await connection.rollback() // Revertir la transacción
      return res.status(404).json({ message: 'Orden de trabajo no encontrada.' })
    }

    // 5. Si todo salió bien, confirmar la transacción
    await connection.commit()

    res.sendStatus(204) // OK, sin contenido
  } catch (error) {
    // 6. Si algo falla, revertir todos los cambios
    await connection.rollback()
    console.error('Error al eliminar la orden:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  } finally {
    // 7. Liberar la conexión para que pueda ser reutilizada
    connection.release()
  }
}

// OBTENER una orden de trabajo por su ID
export const getWorkOrderById = async (req, res) => {
  const { id } = req.params
  try {
    const orderQuery = `
      SELECT 
          wo.id, wo.title, wo.description, wo.status, wo.client_name, 
          wo.start_date, wo.end_date,
          creator.username as created_by
      FROM work_orders wo
      JOIN users creator ON wo.created_by_id = creator.id
      WHERE wo.id = ?
    `
    const [orders] = await pool.query(orderQuery, [id])

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Orden de trabajo no encontrada.' })
    }
    const workOrder = orders[0]

    // Obtener los usuarios asignados
    const assigneesQuery = `SELECT u.id, u.username FROM users u JOIN work_order_assignees woa ON u.id = woa.user_id WHERE woa.work_order_id = ?`
    const [assignees] = await pool.query(assigneesQuery, [id])
    workOrder.assigned_to_ids = assignees.map(a => a.id) // Para el formulario
    workOrder.assigned_to = assignees.map(a => a.username).join(', ') // Para mostrar

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

// USUARIO: Obtener solo las órdenes asignadas al usuario actual
export const getMyWorkOrders = async (req, res) => {
  try {
    const userId = req.userId
    const status = req.query.status

    let query = `
            SELECT 
                wo.id, wo.title, wo.description, wo.status, wo.client_name, wo.end_date,
                creator.username as created_by
            FROM work_orders wo
            JOIN work_order_assignees woa ON wo.id = woa.work_order_id
            JOIN users creator ON wo.created_by_id = creator.id
            WHERE woa.user_id = ?
        `
    const params = [userId]

    if (status && ['pendiente', 'en_progreso', 'por_aprobar', 'completada', 'cancelada'].includes(status)) {
      query += ' AND wo.status = ?'
      params.push(status)
    }

    query += ' ORDER BY wo.end_date DESC'

    const [orders] = await pool.query(query, params)
    res.status(200).json(orders)
  } catch (error) {
    console.error('Error al obtener mis órdenes de trabajo:', error)
    return res.status(500).json({ message: 'Algo salió mal' })
  }
}

// USUARIO: Actualizar el estado de una de sus órdenes de trabajo
export const updateWorkOrderStatus = async (req, res) => {
  const { id } = req.params // ID de la orden de trabajo
  const { status } = req.body // 'pendiente', 'en_progreso', 'completada', etc.
  const user_id = req.userId // Quién hace el cambio (del token JWT)

  if (!status) {
    return res.status(400).json({ message: 'El estado es obligatorio' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction() // INICIAMOS TRANSACCIÓN

    // 1. Actualizar el estado de la Orden de Trabajo
    const [updateResult] = await connection.query('UPDATE work_orders SET status = ? WHERE id = ?', [status, id])

    if (updateResult.affectedRows === 0) {
      throw new Error('Orden de trabajo no encontrada')
    }

    // 2. MAGIA: Si el nuevo estado es 'completada', descontamos el inventario
    if (status === 'completada') {
      // A. Buscar qué productos y qué cantidades se usaron en esta orden
      const [usedProducts] = await connection.query('SELECT product_id, quantity_used FROM work_order_products WHERE work_order_id = ?', [id])

      // B. Recorrer cada producto para descontarlo y registrar el movimiento
      for (const item of usedProducts) {
        // Restar el stock
        const [stockResult] = await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity_used, item.product_id])

        if (stockResult.affectedRows === 0) {
          throw new Error(`Error al actualizar el stock del producto ID: ${item.product_id}`)
        }

        // Registrar en el Kardex como SALIDA y vincularlo a la orden
        await connection.query(
          `
                    INSERT INTO inventory_movements 
                    (product_id, work_order_id, movement_type, user_id, quantity_change, reason) 
                    VALUES (?, ?, 'SALIDA', ?, ?, 'Consumo automático por Orden completada')
                `,
          [
            item.product_id,
            id,
            user_id,
            -item.quantity_used, // Lo guardamos en negativo
          ],
        )
      }
    }

    await connection.commit() // GUARDAMOS TODOS LOS CAMBIOS
    res.status(200).json({ message: `Orden actualizada a ${status} con éxito` })
  } catch (error) {
    await connection.rollback() // REVERTIMOS SI ALGO FALLA
    console.error('Error en updateWorkOrderStatus:', error)
    // Si el error fue nuestro (lanzado arriba), enviamos ese mensaje, si no, uno genérico
    res.status(500).json({ message: error.message || 'Error interno del servidor al actualizar la orden' })
  } finally {
    connection.release() // LIBERAMOS CONEXIÓN
  }
}

// Agregar un producto a una orden de trabajo existente
export const addProductToOrder = async (req, res) => {
  const { id } = req.params
  const { product_id, quantity_used } = req.body

  if (!product_id || !quantity_used) {
    return res.status(400).json({ message: 'Producto y cantidad son requeridos' })
  }

  try {
    // Verificamos si el producto ya está en la orden para sumarlo, si no, lo insertamos
    const [existing] = await pool.query('SELECT * FROM work_order_products WHERE work_order_id = ? AND product_id = ?', [id, product_id])

    if (existing.length > 0) {
      await pool.query('UPDATE work_order_products SET quantity_used = quantity_used + ? WHERE work_order_id = ? AND product_id = ?', [quantity_used, id, product_id])
    } else {
      await pool.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES (?, ?, ?)', [id, product_id, quantity_used])
    }
    res.status(201).json({ message: 'Material agregado a la orden' })
  } catch (error) {
    console.error('Error al agregar material:', error)
    res.status(500).json({ message: 'Error al agregar el material' })
  }
}

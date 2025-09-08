import { pool } from '../config/db.js';
export * from './workOrders.controller.js';
import transporter from '../config/mailer.js'

// ADMIN: Crear una nueva orden de trabajo
export const createWorkOrder = async (req, res) => {
  const { title, description, client_name, assigned_to_id, start_date, end_date, products } = req.body;
  const created_by_id = req.userId;

  if (!title || !assigned_to_id) {
    return res.status(400).json({ message: 'El título y el usuario asignado son requeridos.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO work_orders (title, description, client_name, assigned_to_id, created_by_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, client_name, assigned_to_id, created_by_id, start_date, end_date]
    );
    const workOrderId = result.insertId;
    const workOrderFolio = `OT-${String(workOrderId).padStart(4, '0')}`;

    if (products && products.length > 0) {
      const productValues = products.map((p) => [workOrderId, p.product_id, p.quantity_used]);
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [
        productValues,
      ]);
    }

    // Notificaciones
    const notificationMessage = `Nueva orden (${workOrderFolio}) asignada: "${title}"`;
    await connection.query(
        'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
        [assigned_to_id, notificationMessage, `/my-work-orders`]
    );

    // --- 3. Enviar la notificación por correo electrónico ---
    try {
      // Buscamos el email y nombre del usuario asignado
      const [users] = await pool.query('SELECT email, username FROM users WHERE id = ?', [assigned_to_id]);
      if (users.length > 0) {
        const user = users[0];
        
        // Usamos el 'transporter' para enviar el correo
        await transporter.sendMail({
          from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`, // Remitente
          to: user.email, // Destinatario
          subject: "Nueva Orden de tarbajo Asignada - Sistema Tolko", // Asunto
          html: `
            <h2>Hola ${user.username},</h2>
            <p>Se te ha asignado una nueva orden de trabajo en el Sistema Tolko:</p>
            <br>
            <h3>${title}</h3>
            <p><strong>Cliente:</strong> ${client_name || 'N/A'}</p>
            <p><strong>Fecha de finalización:</strong> ${new Date(end_date).toLocaleDateString()}</p>
            <br>
            <p>Puedes ver los detalles completos iniciando sesión en la plataforma.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("AVISO: La orden se creó, pero falló el envío del correo de notificación:", emailError);
      // No devolvemos un error aquí para que la creación de la tarea no falle si el email no se puede enviar.
    }

    await connection.commit();
    res.status(201).json({ id: workOrderId, ...req.body });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear la orden de trabajo:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  } finally {
    connection.release();
  }
};

// ADMIN: Obtener todas las órdenes de trabajo
export const getWorkOrders = async (req, res) => {
  try {
    const query = `
            SELECT 
                wo.id, wo.title, wo.status, wo.client_name, wo.end_date,
                assignee.username as assigned_to,
                creator.username as created_by
            FROM work_orders wo
            JOIN users assignee ON wo.assigned_to_id = assignee.id
            JOIN users creator ON wo.created_by_id = creator.id
            ORDER BY wo.created_at DESC
        `;
    const [orders] = await pool.query(query);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes de trabajo:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ADMIN: Actualizar una orden de trabajo
export const updateWorkOrder = async (req, res) => {
  const { id } = req.params;
  const { title, description, client_name, assigned_to_id, start_date, end_date, status, products } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener el estado anterior de la orden
    const [currentOrder] = await connection.query('SELECT status FROM work_orders WHERE id = ?', [id]);
    const oldStatus = currentOrder[0]?.status;

    // 1. Actualizar la tabla principal de la orden
    await connection.query(
      'UPDATE work_orders SET title = ?, description = ?, client_name = ?, assigned_to_id = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [title, description, client_name, assigned_to_id, start_date, end_date, status, id]
    );

    // 2. Actualizar los productos (borrar antiguos e insertar nuevos)
    await connection.query('DELETE FROM work_order_products WHERE work_order_id = ?', [id]);
    if (products && products.length > 0) {
      const productValues = products.map((p) => [id, p.product_id, p.quantity_used]);
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [
        productValues,
      ]);
    }

    // --- LÓGICA DE INVENTARIO ---
    // 3. Si el estado cambia a "completada" y antes no lo era
    if (status === 'completada' && oldStatus !== 'completada') {
      if (products && products.length > 0) {
        for (const product of products) {
          // Restar el stock del producto
          await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
            product.quantity_used,
            product.product_id,
          ]);
          // Registrar el movimiento en el historial
          await connection.query(
            'INSERT INTO inventory_movements (product_id, work_order_id, quantity_change, reason) VALUES (?, ?, ?, ?)',
            [product.product_id, id, -product.quantity_used, `Salida por Orden de Trabajo #${id}`]
          );
        }
      }
    }
    // --- FIN DE LÓGICA DE INVENTARIO ---

    // Notificaciones
    const workOrderFolio = `OT-${String(id).padStart(4, '0')}`;
    const notificationMessageUpdate = `La orden "${title}" (${workOrderFolio}) ha sido actualizada.`;
    await connection.query(
        'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
        [assigned_to_id, notificationMessageUpdate, `/my-work-orders`]
    );

    // --- Enviar la notificación por correo electrónico ---
    try {
      // Buscamos el email y nombre del usuario asignado
      const [users] = await pool.query('SELECT email, username FROM users WHERE id = ?', [assigned_to_id]);
      if (users.length > 0) {
        const user = users[0];
        
        // Usamos el 'transporter' para enviar el correo
        await transporter.sendMail({
          from: `"Sistema Tolko" <${process.env.EMAIL_USER}>`, // Remitente
          to: user.email, // Destinatario
          subject: "Orden Actualizada - Sistema Tolko", // Asunto
          html: `
            <h2>Hola ${user.username},</h2>
            <p>Se ha actualizado una orden que tienes asignada en el Sistema Tolko:</p>
            <br>
            <h3>${title}</h3>
            <p><strong>Nuevo estado:</strong> ${status}</p>
            <p><strong>Descripción:</strong> ${description || 'Sin descripción.'}</p>
            <p><strong>Fecha de entrega:</strong> ${new Date(due_date).toLocaleDateString()}</p>
            <br>
            <p>Puedes ver los detalles completos iniciando sesión en la plataforma.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("AVISO: La orden se actualizó, pero falló el envío del correo de notificación:", emailError);
    }

    await connection.commit();
    res.status(200).json({ message: 'Orden de trabajo actualizada correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar la orden:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  } finally {
    connection.release();
  }
};

// ADMIN: Eliminar una orden de trabajo
export const deleteWorkOrder = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection(); // Obtener una conexión del pool

  try {
    // 1. Iniciar una transacción
    await connection.beginTransaction();

    // 2. Eliminar los registros de productos asociados a la orden
    await connection.query('DELETE FROM work_order_products WHERE work_order_id = ?', [id]);

    // 3. Eliminar la orden de trabajo principal
    const [result] = await connection.query('DELETE FROM work_orders WHERE id = ?', [id]);

    // 4. Si no se afectó ninguna fila, la orden no existía
    if (result.affectedRows === 0) {
      await connection.rollback(); // Revertir la transacción
      return res.status(404).json({ message: 'Orden de trabajo no encontrada.' });
    }

    // 5. Si todo salió bien, confirmar la transacción
    await connection.commit();

    res.sendStatus(204); // OK, sin contenido
  } catch (error) {
    // 6. Si algo falla, revertir todos los cambios
    await connection.rollback();
    console.error('Error al eliminar la orden:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  } finally {
    // 7. Liberar la conexión para que pueda ser reutilizada
    connection.release();
  }
};

// OBTENER una orden de trabajo por su ID
export const getWorkOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener los detalles principales de la orden
    const orderQuery = `
      SELECT 
          wo.id, wo.title, wo.description, wo.status, wo.client_name, 
          wo.start_date, wo.end_date,
          wo.assigned_to_id,
          assignee.username as assigned_to,
          creator.username as created_by
      FROM work_orders wo
      JOIN users assignee ON wo.assigned_to_id = assignee.id
      JOIN users creator ON wo.created_by_id = creator.id
      WHERE wo.id = ?
    `;
    const [orders] = await pool.query(orderQuery, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Orden de trabajo no encontrada.' });
    }
    const workOrder = orders[0];

    // 2. Obtener los productos asociados a esa orden
    const productsQuery = `
      SELECT 
        p.id as product_id,
        p.name,
        wop.quantity_used
      FROM work_order_products wop
      JOIN products p ON wop.product_id = p.id
      WHERE wop.work_order_id = ?
    `;
    const [products] = await pool.query(productsQuery, [id]);

    // 3. Combinar los resultados y enviar la respuesta
    workOrder.products = products;
    res.status(200).json(workOrder);
  } catch (error) {
    console.error('Error al obtener la orden de trabajo:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// USUARIO: Obtener solo las órdenes asignadas al usuario actual
export const getMyWorkOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const status = req.query.status; // Leemos el filtro de estado de la URL

        let query = `
            SELECT 
                wo.id, wo.title, wo.description, wo.status, wo.client_name, wo.end_date,
                creator.username as created_by
            FROM work_orders wo
            JOIN users creator ON wo.created_by_id = creator.id
            WHERE wo.assigned_to_id = ?
        `;
        const params = [userId];

        // Si se proporciona un filtro de estado, lo añadimos a la consulta
        if (status && ['pendiente', 'en_progreso', 'completada', 'cancelada'].includes(status)) {
            query += ' AND wo.status = ?';
            params.push(status);
        }

        query += ' ORDER BY wo.end_date ASC';

        const [orders] = await pool.query(query, params);
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener mis órdenes de trabajo:', error);
        return res.status(500).json({ message: 'Algo salió mal' });
    }
};  

// USUARIO: Actualizar el estado de una de sus órdenes de trabajo
export const updateWorkOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    // Validar que el estado sea uno de los permitidos
    if (!status || !['pendiente', 'en_progreso', 'completada', 'cancelada'].includes(status)) {
        return res.status(400).json({ message: 'Estado no válido.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verificar que la orden pertenezca al usuario y actualizarla
        const [result] = await connection.query(
            'UPDATE work_orders SET status = ? WHERE id = ? AND assigned_to_id = ?',
            [status, id, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Orden no encontrada o no tienes permiso para actualizarla.' });
        }

        // 2. Si el nuevo estado es "completada", descontar el inventario (reutilizamos la lógica)
        if (status === 'completada') {
            const [products] = await connection.query('SELECT product_id, quantity_used FROM work_order_products WHERE work_order_id = ?', [id]);
            if (products.length > 0) {
                for (const product of products) {
                    await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [product.quantity_used, product.product_id]);
                    await connection.query('INSERT INTO inventory_movements (product_id, work_order_id, quantity_change, reason) VALUES (?, ?, ?, ?)', [product.product_id, id, -product.quantity_used, `Salida por Orden de Trabajo #${id}`]);
                }
            }
        }

        await connection.commit();
        res.status(200).json({ message: 'Estado de la orden actualizado.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar estado de la orden:', error);
        return res.status(500).json({ message: 'Algo salió mal' });
    } finally {
        connection.release();
    }
};
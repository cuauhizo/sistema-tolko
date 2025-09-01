import { pool } from '../config/db.js';
export * from './workOrders.controller.js';

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

    if (products && products.length > 0) {
      const productValues = products.map((p) => [workOrderId, p.product_id, p.quantity_used]);
      await connection.query('INSERT INTO work_order_products (work_order_id, product_id, quantity_used) VALUES ?', [
        productValues,
      ]);
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

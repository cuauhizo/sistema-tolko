import { pool } from '../config/db.js';

// OBTENER todos los movimientos de inventario
export const getInventoryMovements = async (req, res) => {
  try {
    const query = `
            SELECT 
                im.id,
                im.quantity_change,
                im.reason,
                im.created_at,
                p.name as product_name,
                wo.title as work_order_title
            FROM inventory_movements im
            JOIN products p ON im.product_id = p.id
            LEFT JOIN work_orders wo ON im.work_order_id = wo.id
            ORDER BY im.created_at DESC
        `;
    const [movements] = await pool.query(query);
    res.status(200).json(movements);
  } catch (error) {
    console.error('Error al obtener los movimientos de inventario:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ADMIN: Realizar un ajuste manual de inventario
export const createManualAdjustment = async (req, res) => {
  const { product_id, quantity_change, reason } = req.body;

  // Validación básica
  if (!product_id || !quantity_change || !reason) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Actualizar el stock del producto
    // El 'quantity_change' puede ser positivo (entrada) o negativo (salida)
    await connection.query(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity_change, product_id]
    );

    // 2. Registrar el movimiento en el historial
    await connection.query(
      'INSERT INTO inventory_movements (product_id, quantity_change, reason) VALUES (?, ?, ?)',
      [product_id, quantity_change, reason]
    );

    await connection.commit();
    res.status(200).json({ message: 'Ajuste de inventario realizado correctamente.' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al realizar el ajuste de inventario:', error);
    return res.status(500).json({ message: 'Algo salió mal al procesar el ajuste.' });
  } finally {
    connection.release();
  }
};
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

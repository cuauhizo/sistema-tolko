import { pool } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Contar el total de productos
    const [totalProductsResult] = await pool.query('SELECT COUNT(id) as total FROM products');

    // 2. Encontrar productos con bajo stock (ej. 10 o menos unidades)
    const [lowStockProductsResult] = await pool.query('SELECT COUNT(id) as total FROM products WHERE stock <= 10');

    // 3. Calcular el valor total del inventario (precio * stock)
    const [inventoryValueResult] = await pool.query('SELECT SUM(price * stock) as totalValue FROM products');

    // 4. Contar el total de usuarios registrados
    const [totalUsersResult] = await pool.query('SELECT COUNT(id) as total FROM users');

    const stats = {
      totalProducts: totalProductsResult[0].total || 0,
      lowStockProducts: lowStockProductsResult[0].total || 0,
      inventoryValue: inventoryValueResult[0].totalValue || 0,
      totalUsers: totalUsersResult[0].total || 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener las estadísticas del dashboard:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

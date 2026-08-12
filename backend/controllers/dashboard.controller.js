import { pool } from '../config/db.js'

export const getDashboardStats = async (req, res) => {
  try {
    // 1. KPI: Total de productos
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products WHERE is_active = 1')

    // ¡NUEVO! 2. Salud del Inventario (Para la Dona)
    const [[inventoryStats]] = await pool.query(`
            SELECT 
                SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as outOfStock,
                SUM(CASE WHEN stock > 0 AND stock <= min_stock THEN 1 ELSE 0 END) as lowStock,
                SUM(CASE WHEN stock > min_stock THEN 1 ELSE 0 END) as optimal
            FROM products 
            WHERE is_active = 1
        `)

    // 3. KPIs restantes
    const [[{ activeWorkOrders }]] = await pool.query('SELECT COUNT(*) as activeWorkOrders FROM work_orders WHERE status NOT IN ("completada", "cancelada")')
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users WHERE is_active = 1')
    const [[{ inventoryValue }]] = await pool.query('SELECT SUM(stock * price) as inventoryValue FROM products WHERE is_active = 1')

    // 4. Datos para el Gráfico de Órdenes (Barras)
    const [ordersData] = await pool.query('SELECT status, COUNT(*) as count FROM work_orders GROUP BY status')

    const ordersByStatus = { pendiente: 0, en_progreso: 0, por_aprobar: 0, completada: 0, cancelada: 0 }
    ordersData.forEach(row => {
      if (ordersByStatus[row.status] !== undefined) {
        ordersByStatus[row.status] = row.count
      }
    })

    // Parseamos los datos de la dona para evitar nulos
    const optimal = Number(inventoryStats.optimal) || 0
    const lowStock = Number(inventoryStats.lowStock) || 0
    const outOfStock = Number(inventoryStats.outOfStock) || 0

    // 5. Enviamos todo al frontend
    res.status(200).json({
      totalProducts,
      // Sumamos los bajos y agotados para la tarjeta roja de alerta superior
      lowStockProducts: lowStock + outOfStock,
      activeWorkOrders,
      totalUsers,
      inventoryValue: inventoryValue || 0,
      ordersByStatus,
      // Nueva propiedad para la Dona
      inventoryHealth: { optimal, lowStock, outOfStock },
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ message: 'Error al cargar el dashboard' })
  }
}

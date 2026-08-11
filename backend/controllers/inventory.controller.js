import { pool } from '../config/db.js'

// OBTENER el historial de movimientos (Kardex)
export const getMovements = async (req, res) => {
  try {
    const query = `
            SELECT 
                im.id, im.movement_type, im.quantity_change, im.reason, im.created_at,
                p.name as product_name, p.unit,
                u.username as user_name, 
                w.title as work_order_title
            FROM inventory_movements im
            JOIN products p ON im.product_id = p.id
            JOIN users u ON im.user_id = u.id
            LEFT JOIN work_orders w ON im.work_order_id = w.id
            ORDER BY im.created_at DESC
        `
    const [rows] = await pool.query(query)
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error en getMovements:', error)
    res.status(500).json({ message: 'Error al obtener los movimientos' })
  }
}

// REGISTRAR un nuevo movimiento y actualizar Stock (TRANSACCIÓN)
export const createMovement = async (req, res) => {
  // Los datos vienen del formulario del frontend
  const { product_id, movement_type, quantity, reason, work_order_id } = req.body

  // El ID del usuario lo obtenemos del token de seguridad (middleware authJwt)
  const user_id = req.userId

  if (!product_id || !movement_type || quantity === undefined) {
    return res.status(400).json({ message: 'Faltan campos obligatorios (producto, tipo o cantidad)' })
  }

  // 1. Preparar la lógica matemática
  const absQuantity = Math.abs(parseInt(quantity))
  let quantityChange = 0

  if (movement_type === 'ENTRADA') {
    quantityChange = absQuantity // Suma
  } else if (movement_type === 'SALIDA' || movement_type === 'MERMA') {
    quantityChange = -absQuantity // Resta
  } else if (movement_type === 'AJUSTE') {
    // Un ajuste puede ser positivo o negativo, respetamos el signo que envíe el cliente
    quantityChange = parseInt(quantity)
  } else {
    return res.status(400).json({ message: 'Tipo de movimiento inválido' })
  }

  // 2. Iniciar la conexión para la Transacción
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction() // --- INICIA LA TRANSACCIÓN ---

    // PASO A: Registrar el movimiento en el historial (Kardex)
    const insertQuery = `
            INSERT INTO inventory_movements 
            (product_id, work_order_id, movement_type, user_id, quantity_change, reason) 
            VALUES (?, ?, ?, ?, ?, ?)
        `
    await connection.query(insertQuery, [product_id, work_order_id || null, movement_type, user_id, quantityChange, reason || null])

    // PASO B: Actualizar el stock actual en la tabla de productos
    // Usamos stock + ? porque si es salida, quantityChange ya viene negativo (Ej: stock + (-5) = resta)
    const updateQuery = `
            UPDATE products 
            SET stock = stock + ? 
            WHERE id = ?
        `
    const [updateResult] = await connection.query(updateQuery, [quantityChange, product_id])

    if (updateResult.affectedRows === 0) {
      throw new Error('Producto no encontrado al intentar actualizar el stock')
    }

    await connection.commit() // --- TODO SALIÓ BIEN: GUARDAR CAMBIOS ---
    res.status(201).json({
      message: 'Movimiento registrado exitosamente',
      quantity_change: quantityChange,
    })
  } catch (error) {
    await connection.rollback() // --- ERROR: DESHACER TODOS LOS CAMBIOS ---
    console.error('Transacción abortada en createMovement:', error)
    res.status(500).json({ message: 'Error procesando el inventario. Cambios revertidos.', error: error.message })
  } finally {
    connection.release() // --- SIEMPRE LIBERAR LA CONEXIÓN AL FINAL ---
  }
}

import { pool } from '../config/db.js'

// OBTENER todos los productos (con nombre de categoría y proveedor)
export const getProducts = async (req, res) => {
  try {
    const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC
        `
    const [rows] = await pool.query(query)
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error en getProducts:', error)
    res.status(500).json({ message: 'Error al obtener productos' })
  }
}

// OBTENER un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ? AND p.is_active = 1
        `
    const [rows] = await pool.query(query, [id])

    if (rows.length <= 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.status(200).json(rows[0])
  } catch (error) {
    console.error('Error en getProductById:', error)
    res.status(500).json({ message: 'Error al obtener el producto' })
  }
}

// CREAR un nuevo producto
export const createProduct = async (req, res) => {
  // Extraemos supplier_id del cuerpo de la petición
  const { name, description, stock, price, unit, category_id, supplier_id } = req.body

  // Validación básica
  if (!name || !price) {
    return res.status(400).json({ message: 'El nombre y el precio son obligatorios' })
  }

  try {
    const [result] = await pool.query('INSERT INTO products (name, description, stock, price, unit, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      name,
      description || null,
      stock || 0,
      price,
      unit || 'piezas',
      category_id || null,
      supplier_id || null, // Aquí guardamos el proveedor
    ])

    res.status(201).json({
      id: result.insertId,
      name,
      stock,
      price,
      supplier_id,
    })
  } catch (error) {
    console.error('Error en createProduct:', error)
    res.status(500).json({ message: 'Error al crear el producto' })
  }
}

// ACTUALIZAR un producto
export const updateProduct = async (req, res) => {
  const { id } = req.params
  const { name, description, stock, price, unit, category_id, supplier_id } = req.body

  try {
    const [result] = await pool.query('UPDATE products SET name = ?, description = ?, stock = ?, price = ?, unit = ?, category_id = ?, supplier_id = ? WHERE id = ?', [name, description, stock, price, unit, category_id, supplier_id, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.status(200).json({ message: 'Producto actualizado correctamente' })
  } catch (error) {
    console.error('Error en updateProduct:', error)
    res.status(500).json({ message: 'Error al actualizar el producto' })
  }
}

// ELIMINAR (Soft Delete) un producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params
  try {
    // En lugar de hacer 'DELETE FROM', actualizamos is_active a 0
    const [result] = await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id])

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.sendStatus(204)
  } catch (error) {
    console.error('Error en deleteProduct:', error)
    res.status(500).json({ message: 'Error al eliminar el producto' })
  }
}

// OBTENER productos con stock bajo (Dashboard)
export const getLowStockProducts = async (req, res) => {
  try {
    // Consideramos "Bajo Stock" a cualquier producto con 10 unidades o menos
    const query = `
            SELECT id, name, stock, unit 
            FROM products 
            WHERE is_active = 1 AND stock <= 10
            ORDER BY stock ASC
            LIMIT 10
        `
    const [rows] = await pool.query(query)
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error en getLowStockProducts:', error)
    res.status(500).json({ message: 'Error al obtener productos con bajo stock' })
  }
}

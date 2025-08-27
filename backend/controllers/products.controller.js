import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    // Usamos un LEFT JOIN para unir las tablas products y categories
    const query = `
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.stock, 
                p.price, 
                p.unit,
                p.category_id,
                c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
            SELECT 
                p.id, p.name, p.description, p.stock, p.price, p.unit, 
                c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
    const [rows] = await pool.query(query, [id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const createProduct = async (req, res) => {
  // Extraemos category_id del body
  const { name, description, stock, price, unit, category_id } = req.body;

  if (!name || stock == null || price == null || !unit) {
    return res.status(400).json({ message: 'Petición incorrecta. Por favor, completa todos los campos requeridos.' });
  }

  try {
    // Añadimos category_id a la inserción
    const [result] = await pool.query(
      'INSERT INTO products (name, description, stock, price, unit, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, stock, price, unit, category_id || null]
    );

    // --- ESTA ES LA PARTE CORREGIDA ---
    // Después de insertar, obtenemos el producto completo con su categoría
    const newProductId = result.insertId;
    const query = `
            SELECT 
                p.id, p.name, p.description, p.stock, p.price, p.unit, p.category_id,
                c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
    const [rows] = await pool.query(query, [newProductId]);

    res.status(201).json(rows[0]); // Devolvemos el objeto completo
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, stock, price, unit, category_id } = req.body;

    if (!name || stock == null || price == null || !unit) {
      return res.status(400).json({ message: 'Petición incorrecta. Por favor, completa todos los campos requeridos.' });
    }

    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, stock = ?, price = ?, unit = ?, category_id = ? WHERE id = ?',
      [name, description, stock, price, unit, category_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const query = `
            SELECT 
                p.id, p.name, p.description, p.stock, p.price, p.unit, p.category_id,
                c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
    const [rows] = await pool.query(query, [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // 204 significa "Sin Contenido", una respuesta estándar para un DELETE exitoso.
    res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

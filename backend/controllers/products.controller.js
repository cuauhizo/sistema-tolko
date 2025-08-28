import { pool } from '../config/db.js';

// CREAR un nuevo producto
export const createProduct = async (req, res) => {
  const { name, description, stock, price, unit, category_id } = req.body;

  if (!name || stock == null || price == null || !unit) {
    return res.status(400).json({ message: 'Petición incorrecta. Por favor, completa todos los campos requeridos.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, stock, price, unit, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, stock, price, unit, category_id || null]
    );

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

// OBTENER todos los productos
export const getProducts = async (req, res) => {
  try {
    // Leemos los parámetros 'page' y 'limit' de la URL. Si no vienen, usamos valores por defecto.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Primero, contamos el total de productos para la paginación
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM products');
    const totalProducts = totalRows[0].total;

    // Luego, obtenemos solo los productos para la página actual
    const query = `
            SELECT
                p.id, p.name, p.description, p.stock, p.price, p.unit, p.category_id,
                c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
    const [products] = await pool.query(query, [limit, offset]);

    // Enviamos una respuesta estructurada que el frontend pueda usar
    res.status(200).json({
      data: products,
      pagination: {
        total: totalProducts,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ACTUALIZAR un producto
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

// ELIMINAR un producto
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

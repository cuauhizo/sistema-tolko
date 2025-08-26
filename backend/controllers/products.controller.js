import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal.' });
    }
};

export const createProduct = async (req, res) => {
    // 1. Extraemos 'unit' del cuerpo de la petición
    const { name, description, stock, price, unit } = req.body;

    // 2. Actualizamos la validación
    if (!name || stock == null || price == null || !unit) {
        return res.status(400).json({ message: 'Petición incorrecta. Por favor, completa todos los campos requeridos.' });
    }

    try {
        // 3. Añadimos 'unit' a la consulta SQL
        const [result] = await pool.query(
            'INSERT INTO products (name, description, stock, price, unit) VALUES (?, ?, ?, ?, ?)',
            [name, description, stock, price, unit]
        );

        // 4. Devolvemos el producto recién creado, incluyendo la unidad
        const newProduct = {
            id: result.insertId,
            name,
            description,
            stock,
            price,
            unit
        };

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al crear el producto:", error);
        return res.status(500).json({ message: 'Algo salió mal' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, stock, price, unit } = req.body;

        // Validación de los datos de entrada
        if (!name || stock == null || price == null || !unit) {
            return res.status(400).json({ message: 'Petición incorrecta. Por favor, completa los campos requeridos.' });
        }

        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, stock = ?, price = ?, unit = ? WHERE id = ?',
            [name, description, stock, price, unit, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Devolvemos el producto con los datos actualizados
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Error al actualizar el producto:", error);
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
        console.error("Error al eliminar el producto:", error);
        return res.status(500).json({ message: 'Algo salió mal' });
    }
};
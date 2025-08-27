import { pool } from '../config/db.js';

// OBTENER todas las categorías
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// CREAR una nueva categoría
export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es un campo requerido.' });
  }
  try {
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
    console.error('Error al crear la categoría:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ACTUALIZAR una categoría
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre es un campo requerido.' });
  }
  try {
    const [result] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
    console.error('Error al actualizar la categoría:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

// ELIMINAR una categoría
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    return res.status(500).json({ message: 'Algo salió mal' });
  }
};

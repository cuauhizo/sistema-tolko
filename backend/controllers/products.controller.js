import { pool } from '../config/db.js';

export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal.' });
    }
};

// ... y así para los otros métodos (create, update, delete)

export const createProduct = async (req, res) => {
    try {
        // const [rows] = await pool.query('SELECT * FROM products');
        // res.json(rows);
        console.log('Desde controlador createProduct.');
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal.' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        // const [rows] = await pool.query('SELECT * FROM products');
        // res.json(rows);
        console.log('Desde controlador updateProduct.');
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal.' });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        // const [rows] = await pool.query('SELECT * FROM products');
        // res.json(rows);
        console.log('Desde controlador deleteProduct.');
    } catch (error) {
        return res.status(500).json({ message: 'Algo salió mal.' });
    }
}
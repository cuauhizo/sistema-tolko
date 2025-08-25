import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { pool } from '../config/db.js';

config();

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if (!token) return res.status(403).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Guardamos el id del usuario en el objeto request

        // Opcional: Verificar que el usuario realmente existe
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No user found' });
        }

        next(); // Si todo es correcto, continúa a la siguiente función (el controlador)
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const isAdmin = async (req, res, next) => {
    const [users] = await pool.query('SELECT role_id FROM users WHERE id = ?', [req.userId]);
    const [roles] = await pool.query('SELECT name FROM roles WHERE id = ?', [users[0].role_id]);

    if (roles[0].name === 'admin') {
        next();
        return;
    }

    return res.status(403).json({ message: 'Require Admin Role!' });
};
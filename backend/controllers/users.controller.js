import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// OBTENER todos los usuarios
export const getUsers = async (req, res) => {
    try {
        // Hacemos un JOIN para obtener también el nombre del rol
        const [rows] = await pool.query(
            'SELECT u.id, u.username, u.email, u.created_at, r.name as role FROM users u JOIN roles r ON u.role_id = r.id'
        );
        res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

// CREAR un nuevo usuario (por un admin)
export const createUser = async (req, res) => {
    const { username, email, password, role_id } = req.body;
    if (!username || !email || !password || !role_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role_id]
        );
        
        res.status(201).json({
            id: result.insertId,
            username,
            email,
            role_id
        });
    } catch (error) {
         // Código de error para duplicados en MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

// OBTENER un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT id, username, email, role_id FROM users WHERE id = ?', [id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

// ACTUALIZAR un usuario
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, role_id } = req.body;

    try {
        // Opcional: Manejar actualización de contraseña si se proporciona
        // if (req.body.password) { ... hashear y agregar al UPDATE ... }

        const [result] = await pool.query(
            'UPDATE users SET username = ?, email = ?, role_id = ? WHERE id = ?',
            [username, email, role_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Devolvemos los datos actualizados
        const [updatedUser] = await pool.query('SELECT id, username, email, role_id FROM users WHERE id = ?', [id]);
        res.status(200).json(updatedUser[0]);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

// ELIMINAR un usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 204 significa "No Content", una respuesta común para un DELETE exitoso.
        res.sendStatus(204); 
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
};
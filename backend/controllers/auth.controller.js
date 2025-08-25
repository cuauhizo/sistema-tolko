import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config(); // Para acceder a las variables de entorno

// Función para REGISTRAR un usuario (Sign Up)
export const signUp = async (req, res) => {
    const { username, email, password, role_id } = req.body;

    try {
        // 1. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Guardar el nuevo usuario en la base de datos
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role_id || 2] // Asigna rol 'editor' por defecto si no se especifica
        );

        // 3. Crear un token JWT
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        res.status(201).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create user' });
    }
};

// Función para INICIAR SESIÓN (Sign In)
export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario por email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // 2. Comparar la contraseña ingresada con la hasheada en la BD
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ token: null, message: 'Invalid Password' });
        }

        // 3. Si es válida, crear y enviar el token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login error' });
    }
};
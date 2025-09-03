import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// CREAR un nuevo usuario (por un admin)
export const createUser = async (req, res) => {
  const { username, email, password, role_id } = req.body;

  if (!username || !email || !password || !role_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query('INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)', [
      username,
      email,
      hashedPassword,
      role_id,
    ]);

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role_id,
    });
  } catch (error) {
    // Código de error para duplicados en MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El nombre de usuario o correo electrónico ya existe.' });
    }
    return res.status(500).json({ message: 'Algo salió mal.' });
  }
};

// OBTENER todos los usuarios
export const getUsers = async (req, res) => {
  try {
    // Leemos los parámetros 'page' y 'limit' de la URL. Si no vienen, usamos valores por defecto.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Primero, contamos el total de usuarios para la paginación
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = totalRows[0].total;

    // Luego, obtenemos solo los usuarios para la página actual
    const query = `
      SELECT
        u.id, u.username, u.email, u.created_at, u.role_id,
        r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at ASC
      LIMIT ? OFFSET ?
    `;
    const [users] = await pool.query(query, [limit, offset]);
    // Enviamos una respuesta estructurada que el frontend pueda usar
    res.status(200).json({
      data: users,
      pagination: {
        total: totalUsers,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({ message: 'Algo salió mal.' });
  }
};

// ACTUALIZAR un usuario
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role_id, password } = req.body;

  try {
    // Opcional: Manejar actualización de contraseña si se proporciona
    let query = 'UPDATE users SET username = ?, email = ?, role_id = ?';
    const params = [username, email, role_id];

    // --- LÓGICA PARA LA CONTRASEÑA ---
    // Si el usuario envió una nueva contraseña...
    if (password) {
      // 1. Hashear la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // 2. Añadirla a la consulta y a los parámetros
      query += ', password = ?';
      params.push(hashedPassword);
    }
    // --- FIN DE LA LÓGICA ---

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Devolvemos los datos actualizados
    const [updatedUser] = await pool.query('SELECT id, username, email, role_id FROM users WHERE id = ?', [id]);
    res.status(200).json(updatedUser[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El nombre de usuario o correo electrónico ya existe.' });
    }
    return res.status(500).json({ message: 'Algo salió mal.' });
  }
};

// ELIMINAR un usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    // 204 significa "No Content", una respuesta común para un DELETE exitoso.
    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: 'Algo salió mal.' });
  }
};

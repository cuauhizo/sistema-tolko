import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config() // Para acceder a las variables de entorno

// Función para REGISTRAR un usuario (Sign Up)
export const signUp = async (req, res) => {
  const { username, email, password, role_id } = req.body

  try {
    // 1. Hashear la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 2. Guardar el nuevo usuario en la base de datos
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role_id || 2], // Asigna rol 'editor' por defecto si no se especifica
    )

    // 3. Crear un token JWT
    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 horas
    })

    res.status(201).json({ token })
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    // Añade esta condición para manejar duplicados
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El nombre de usuario o el correo ya existen.' })
    }
    return res.status(500).json({ message: 'No se pudo crear el usuario.' })
  }
}

// Función para INICIAR SESIÓN (Sign In)
export const signIn = async (req, res) => {
  const { email, password } = req.body

  try {
    // 1. Buscar al usuario por email y traer su rol
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.is_active = TRUE
    `
    const [users] = await pool.query(query, [email])

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o dado de baja' })
    }
    const user = users[0]

    // 2. Comparar la contraseña ingresada con la hasheada
    const passwordIsValid = await bcrypt.compare(password, user.password)
    if (!passwordIsValid) {
      return res.status(401).json({ token: null, message: 'Contraseña no válida' })
    }

    // 3. Buscar los permisos específicos para el rol de este usuario
    const [permissionsData] = await pool.query(
      `SELECT p.name 
       FROM permissions p 
       JOIN role_permissions rp ON p.id = rp.permission_id 
       WHERE rp.role_id = ?`,
      [user.role_id],
    )

    // Transformamos el resultado en un arreglo simple (ej. ['read_clients', 'create_clients'])
    const userPermissions = permissionsData.map(p => p.name)

    // 4. Crear el token INCLUYENDO el arreglo de permisos
    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        role: user.role_name,
        permissions: userPermissions,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400, // 24 horas
      },
    )

    res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error de inicio de sesión' })
  }
}

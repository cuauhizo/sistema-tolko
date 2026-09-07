import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import { pool } from '../config/db.js'

config()

// 1. VALIDA EL TOKEN Y EXTRAE DATOS
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1]

    if (!token) return res.status(403).json({ message: 'No se ha proporcionado ningún token.' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Guardamos los datos vitales en el request para el siguiente paso
    req.userId = decoded.id
    req.userRole = decoded.role
    req.userPermissions = decoded.permissions || [] // Leemos los permisos del token

    // Verificamos que el usuario aún exista en BD (seguridad extra)
    const [users] = await pool.query('SELECT id FROM users WHERE id = ? AND is_active = 1', [req.userId])
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo.' })
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Sesión expirada o token no autorizado.' })
  }
}

// 2. Verifica permisos dinámicos
export const hasPermission = requiredPermission => {
  return (req, res, next) => {
    // Si el usuario es superadmin, lo dejamos pasar a todo por defecto
    if (req.userRole === 'superadmin') {
      return next()
    }

    // Si tiene el permiso específico en su arreglo, lo dejamos pasar
    if (req.userPermissions && req.userPermissions.includes(requiredPermission)) {
      return next()
    }

    // Si no, lo bloqueamos
    return res.status(403).json({
      message: `Acceso denegado. Se requiere el permiso: ${requiredPermission}`,
    })
  }
}

// 3. Mantenemos el antiguo hasRole por compatibilidad si aún lo tienes en algunas rutas
export const hasRole = rolesPermitidos => {
  return (req, res, next) => {
    if (!req.userRole) return res.status(500).json({ message: 'Error de validación.' })

    if (rolesPermitidos.includes(req.userRole)) {
      next()
    } else {
      return res.status(403).json({ message: `Acceso denegado. Privilegios insuficientes.` })
    }
  }
}

// Alias para mantener compatibilidad con rutas antiguas
export const isAdmin = hasRole(['superadmin', 'administracion'])

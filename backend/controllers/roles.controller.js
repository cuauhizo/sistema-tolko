import { pool } from '../config/db.js'

// 1. OBTENER el catálogo de perfiles (Roles)
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles')
    res.status(200).json(roles)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los roles' })
  }
}

// 2. OBTENER todos los permisos disponibles en el sistema
export const getPermissions = async (req, res) => {
  try {
    // Los ordenamos por módulo para que sea más fácil procesarlos en Vue
    const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY module ASC, name ASC')
    res.status(200).json(permissions)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los permisos' })
  }
}

// 3. OBTENER los permisos asignados a un rol específico
export const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params
    const [permissions] = await pool.query('SELECT permission_id FROM role_permissions WHERE role_id = ?', [id])
    res.status(200).json(permissions)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los permisos del rol' })
  }
}

// 4. ACTUALIZAR los permisos de un rol
export const updateRolePermissions = async (req, res) => {
  const { id } = req.params
  const { permissions } = req.body // Recibe un arreglo de IDs, ej: [1, 2, 5, 8]

  try {
    // CANDADO DE SEGURIDAD ABSOLUTO: Nadie puede modificar al SuperADMIN (ID 1)
    if (parseInt(id) === 1) {
      return res.status(403).json({ message: 'Denegado: No se pueden modificar los permisos del Super Administrador.' })
    }

    // Paso A: Borramos TODOS los permisos actuales que tenía este rol
    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [id])

    // Paso B: Si el arreglo trae permisos nuevos, los insertamos uno por uno
    if (permissions && permissions.length > 0) {
      // Convertimos el arreglo de Vue en un formato válido para inserción múltiple en MySQL
      const values = permissions.map(permId => [id, permId])
      await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [values])
    }

    res.status(200).json({ message: 'Permisos actualizados correctamente' })
  } catch (error) {
    console.error('Error al actualizar permisos:', error)
    res.status(500).json({ message: 'Error interno al guardar los permisos' })
  }
}

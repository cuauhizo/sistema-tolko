import { pool } from '../config/db.js'

// OBTENER todos los proveedores
export const getSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC')
    res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener proveedores' })
  }
}

// OBTENER un proveedor por ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id])

    if (rows.length <= 0) return res.status(404).json({ message: 'Proveedor no encontrado' })

    res.status(200).json(rows[0])
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el proveedor' })
  }
}

// CREAR un nuevo proveedor
export const createSupplier = async (req, res) => {
  // 1. Agregamos 'giro' aquí
  const { name, giro, contact_email, phone, address } = req.body

  if (!name) return res.status(400).json({ message: 'El nombre del proveedor es obligatorio' })

  try {
    // 2. Agregamos 'giro' a la consulta SQL y a los valores
    const [result] = await pool.query('INSERT INTO suppliers (name, giro, contact_email, phone, address) VALUES (?, ?, ?, ?, ?)', [name, giro, contact_email, phone, address])
    res.status(201).json({ id: result.insertId, name, giro, contact_email, phone, address })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear el proveedor' })
  }
}

// ACTUALIZAR un proveedor
export const updateSupplier = async (req, res) => {
  const { id } = req.params
  // 3. Agregamos 'giro' aquí también
  const { name, giro, contact_email, phone, address } = req.body

  try {
    // 4. Actualizamos el query para incluir 'giro = ?'
    const [result] = await pool.query('UPDATE suppliers SET name = ?, giro = ?, contact_email = ?, phone = ?, address = ? WHERE id = ?', [name, giro, contact_email, phone, address, id])

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Proveedor no encontrado' })

    res.status(200).json({ message: 'Proveedor actualizado correctamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el proveedor' })
  }
}

// ELIMINAR un proveedor
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id])

    if (result.affectedRows <= 0) return res.status(404).json({ message: 'Proveedor no encontrado' })

    res.sendStatus(204)
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el proveedor' })
  }
}

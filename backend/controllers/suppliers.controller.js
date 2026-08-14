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
  try {
    // 1. Extraemos los campos (incluyendo los nuevos)
    const { name, giro, contact_name, contact_phone, contact_email, phone, email, address } = req.body

    // 2. Agregamos los signos de interrogación y los valores a la consulta
    const [result] = await pool.query('INSERT INTO suppliers (name, giro, contact_name, contact_phone, contact_email, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      name,
      giro,
      contact_name,
      contact_phone,
      contact_email,
      phone,
      email,
      address,
    ])

    res.status(201).json({ id: result.insertId, message: 'Proveedor creado exitosamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear el proveedor' })
  }
}

// ACTUALIZAR un proveedor
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params
    // 1. Extraemos los campos
    const { name, giro, contact_name, contact_phone, contact_email, phone, email, address } = req.body

    // 2. Los agregamos al SET de la consulta
    await pool.query('UPDATE suppliers SET name = ?, giro = ?, contact_name = ?, contact_phone = ?, contact_email = ?, phone = ?, email = ?, address = ? WHERE id = ?', [
      name,
      giro,
      contact_name,
      contact_phone,
      contact_email,
      phone,
      email,
      address,
      id,
    ])

    res.json({ message: 'Proveedor actualizado exitosamente' })
  } catch (error) {
    console.error(error)
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

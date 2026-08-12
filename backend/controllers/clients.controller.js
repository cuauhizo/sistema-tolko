import { pool } from '../config/db.js'

// OBTENER todos los clientes activos
export const getClients = async (req, res) => {
  try {
    const query = 'SELECT * FROM clients WHERE is_active = 1 ORDER BY created_at DESC'
    const [rows] = await pool.query(query)
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error en getClients:', error)
    res.status(500).json({ message: 'Error al obtener los clientes' })
  }
}

// OBTENER un cliente por ID
export const getClientById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? AND is_active = 1', [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    res.status(200).json(rows[0])
  } catch (error) {
    console.error('Error en getClientById:', error)
    res.status(500).json({ message: 'Error al obtener el cliente' })
  }
}

// CREAR un nuevo cliente
export const createClient = async (req, res) => {
  const { name, company, email, phone, address } = req.body

  if (!name) {
    return res.status(400).json({ message: 'El nombre del cliente es obligatorio' })
  }

  try {
    const [result] = await pool.query('INSERT INTO clients (name, company, email, phone, address) VALUES (?, ?, ?, ?, ?)', [name, company || null, email || null, phone || null, address || null])

    res.status(201).json({
      id: result.insertId,
      name,
      company,
      email,
      phone,
      address,
    })
  } catch (error) {
    console.error('Error en createClient:', error)
    res.status(500).json({ message: 'Error al crear el cliente' })
  }
}

// ACTUALIZAR un cliente
export const updateClient = async (req, res) => {
  const { id } = req.params
  const { name, company, email, phone, address } = req.body

  if (!name) {
    return res.status(400).json({ message: 'El nombre del cliente es obligatorio' })
  }

  try {
    const [result] = await pool.query('UPDATE clients SET name = ?, company = ?, email = ?, phone = ?, address = ? WHERE id = ?', [name, company || null, email || null, phone || null, address || null, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    res.status(200).json({ message: 'Cliente actualizado correctamente' })
  } catch (error) {
    console.error('Error en updateClient:', error)
    res.status(500).json({ message: 'Error al actualizar el cliente' })
  }
}

// ELIMINAR (Soft Delete) un cliente
export const deleteClient = async (req, res) => {
  const { id } = req.params
  try {
    // En lugar de hacer DELETE, cambiamos is_active a 0
    const [result] = await pool.query('UPDATE clients SET is_active = 0 WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    res.sendStatus(204)
  } catch (error) {
    console.error('Error en deleteClient:', error)
    res.status(500).json({ message: 'Error al eliminar el cliente' })
  }
}

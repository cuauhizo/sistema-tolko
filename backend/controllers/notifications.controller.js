import { pool } from '../config/db.js';

// Obtener notificaciones no leídas para el usuario logueado
export const getUnreadNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
};

// Marcar una notificación como leída
export const markAsRead = async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Notificación marcada como leída' });
        } else {
            res.status(404).json({ message: 'Notificación no encontrada o no pertenece al usuario.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la notificación' });
    }
};
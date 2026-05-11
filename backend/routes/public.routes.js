import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleContactForm } from '../controllers/public.controller.js';

const router = express.Router();

// Configuramos el límite: máximo 3 correos cada 15 minutos por IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Límite de 3 peticiones por IP
  message: { msg: 'Has enviado demasiados mensajes. Por favor, intenta de nuevo más tarde.' }
});

// Aplicamos el middleware SOLO a esta ruta
router.post('/contact', contactLimiter, handleContactForm);

export default router;
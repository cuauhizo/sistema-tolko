import express from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { handleContactForm, handleCareersForm } from '../controllers/public.controller.js'

const router = express.Router()

// Configurar multer para guardar el archivo en memoria (ideal para enviarlo directo por correo)
const upload = multer({ storage: multer.memoryStorage() })

// Configuramos el límite: máximo 3 correos cada 15 minutos por IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // Límite de 3 peticiones por IP
  message: { msg: 'Has enviado demasiados mensajes. Por favor, intenta de nuevo más tarde.' },
})

// Aplicamos el middleware SOLO a esta ruta
router.post('/contact', contactLimiter, handleContactForm)

// upload.single('cv') le dice a la API que busque un archivo con el nombre "cv"
router.post('/careers', contactLimiter, upload.single('cv'), handleCareersForm)

export default router

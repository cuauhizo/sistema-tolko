import express from 'express';
import { handleContactForm } from '../controllers/public.controller.js';

const router = express.Router();

// Ruta para el formulario de contacto
router.post('/contact', handleContactForm);

export default router;

import { Router } from 'express';
import { signUp, signIn } from '../controllers/auth.controller.js';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/signup', signUp);

// Ruta para iniciar sesión
router.post('/signin', signIn);

export default router;
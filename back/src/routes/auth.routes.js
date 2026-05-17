import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/register', register);
router.post('/login', login);

// Rutas de prueba para validar que los middlewares funcionan
router.get('/perfil', verifyToken, (req, res) => {
    res.json({ message: 'Perfil verificado con éxito', usuario: req.usuario });
});

router.get('/admin-dashboard', verifyToken, isAdmin, (req, res) => {
    res.json({ message: 'Bienvenido al panel de administración', usuario: req.usuario });
});

export default router;

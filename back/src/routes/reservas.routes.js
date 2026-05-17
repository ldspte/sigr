import { Router } from 'express';
import { getReservas, createReserva, updateReservaStatus } from '../controllers/reservas.controller.js';
import { verifyToken, isStaff } from '../middlewares/auth.middleware.js';

const router = Router();

// Clientes autenticados pueden crear reservas
router.post('/', verifyToken, createReserva);

// Solo el staff (meseros/admins) pueden ver todas las reservas y actualizarlas
router.get('/', verifyToken, isStaff, getReservas);
router.patch('/:id/estado', verifyToken, isStaff, updateReservaStatus);

export default router;

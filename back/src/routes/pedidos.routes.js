import { Router } from 'express';
import { getPedidos, createPedido, updatePedidoStatus } from '../controllers/pedidos.controller.js';
import { verifyToken, isStaff } from '../middlewares/auth.middleware.js';

const router = Router();

// Cualquiera que esté autenticado puede crear un pedido
router.post('/', verifyToken, createPedido);

// Solo el staff puede ver todos los pedidos y actualizar su estado
router.get('/', verifyToken, isStaff, getPedidos);
router.patch('/:id/estado', verifyToken, isStaff, updatePedidoStatus);

export default router;

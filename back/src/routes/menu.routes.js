import { Router } from 'express';
import { getCategorias, createCategoria, getPlatos, createPlato, updatePlatoStatus } from '../controllers/menu.controller.js';
import { verifyToken, isAdmin, isStaff } from '../middlewares/auth.middleware.js';

const router = Router();

// Categorías
router.get('/categorias', getCategorias); 
router.post('/categorias', verifyToken, isAdmin, createCategoria); 

// Platos
router.get('/platos', getPlatos); 
router.post('/platos', verifyToken, isAdmin, createPlato); 
router.patch('/platos/:id/estado', verifyToken, isStaff, updatePlatoStatus); 

export default router;

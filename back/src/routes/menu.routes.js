import { Router } from 'express';
import { getCategorias, createCategoria, deleteCategoria, getPlatos, createPlato, updatePlatoStatus, deletePlato } from '../controllers/menu.controller.js';
import { verifyToken, isAdmin, isStaff } from '../middlewares/auth.middleware.js';

const router = Router();

// Categorías
router.get('/categorias', getCategorias); 
router.post('/categorias', verifyToken, isAdmin, createCategoria); 
router.delete('/categorias/:id', verifyToken, isAdmin, deleteCategoria);

// Platos
router.get('/platos', getPlatos); 
router.post('/platos', verifyToken, isAdmin, createPlato); 
router.patch('/platos/:id/estado', verifyToken, isStaff, updatePlatoStatus); 
router.delete('/platos/:id', verifyToken, isAdmin, deletePlato);

export default router;

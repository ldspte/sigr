import { Router } from 'express';
import { generarFactura, getReporteCierre } from '../controllers/facturacion.controller.js';
import { verifyToken, isStaff, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Staff puede generar una factura para cobrar una mesa
router.post('/generar', verifyToken, isStaff, generarFactura);

// Solo el administrador tiene acceso a los reportes financieros (cierre de caja)
router.get('/reporte', verifyToken, isAdmin, getReporteCierre);

export default router;

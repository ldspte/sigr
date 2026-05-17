import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import facturacionRoutes from './routes/facturacion.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/facturacion', facturacionRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de SIGR' });
});

// Test DB Connection Route
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'Conexión a BD exitosa', result: rows[0].solution });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error conectando a BD', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

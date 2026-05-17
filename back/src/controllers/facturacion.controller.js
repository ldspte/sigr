import pool from '../config/db.js';

export const generarFactura = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { pedido_id } = req.body;

        await connection.beginTransaction();

        // 1. Obtener información del pedido
        const [pedidos] = await connection.query('SELECT * FROM pedidos WHERE id = ?', [pedido_id]);
        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        const pedido = pedidos[0];
        
        // 2. Evitar facturar el mismo pedido dos veces
        const [facturasExistentes] = await connection.query('SELECT * FROM facturas WHERE pedido_id = ?', [pedido_id]);
        if (facturasExistentes.length > 0) {
            return res.status(400).json({ message: 'Este pedido ya fue facturado anteriormente' });
        }

        // 3. Crear la factura (usa el total del pedido)
        const [facturaResult] = await connection.query(
            'INSERT INTO facturas (pedido_id, total) VALUES (?, ?)',
            [pedido_id, pedido.total]
        );

        // 4. Actualizar estado del pedido a 'pagado'
        await connection.query('UPDATE pedidos SET estado = "pagado" WHERE id = ?', [pedido_id]);

        await connection.commit();
        res.status(201).json({ message: 'Factura generada y pedido pagado exitosamente', facturaId: facturaResult.insertId, total: pedido.total });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error al generar factura', error: error.message });
    } finally {
        connection.release();
    }
};

export const getReporteCierre = async (req, res) => {
    try {
        // Agrupa las ventas por día y calcula el total
        const [rows] = await pool.query(`
            SELECT DATE(fecha_emision) as fecha, COUNT(*) as total_ventas, SUM(total) as ingresos
            FROM facturas
            GROUP BY DATE(fecha_emision)
            ORDER BY fecha DESC
            LIMIT 30
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};

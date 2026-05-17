import pool from '../config/db.js';

export const getPedidos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.nombre as cliente, m.nombre as mesero, me.numero_mesa
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            LEFT JOIN usuarios m ON p.mesero_id = m.id
            LEFT JOIN mesas me ON p.mesa_id = me.id
            ORDER BY p.creado_en DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
    }
};

export const createPedido = async (req, res) => {
    // Body esperado: { mesa_id, detalles: [{ plato_id: 1, cantidad: 2, precio_unitario: 10.50 }] }
    const connection = await pool.getConnection();
    try {
        const { mesa_id, detalles } = req.body;
        
        // Identificar quién hace el pedido según su rol
        const usuario_id = req.usuario.rol === 'cliente' ? req.usuario.id : null;
        const mesero_id = req.usuario.rol === 'mesero' ? req.usuario.id : null;

        await connection.beginTransaction();

        // Calcular total del pedido
        const total = detalles.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

        // 1. Insertar Cabecera del Pedido
        let mesaIdReal = null;
        if (mesa_id) {
            const [mesas] = await connection.query('SELECT id FROM mesas WHERE numero_mesa = ?', [mesa_id]);
            if (mesas.length > 0) {
                mesaIdReal = mesas[0].id;
            } else {
                const [insertMesa] = await connection.query('INSERT INTO mesas (numero_mesa, capacidad) VALUES (?, 4)', [mesa_id]);
                mesaIdReal = insertMesa.insertId;
            }
        }

        const [pedidoResult] = await connection.query(
            'INSERT INTO pedidos (usuario_id, mesero_id, mesa_id, total) VALUES (?, ?, ?, ?)',
            [usuario_id, mesero_id, mesaIdReal, total]
        );
        const pedidoId = pedidoResult.insertId;

        // 2. Insertar Detalles
        for (const detalle of detalles) {
            await connection.query(
                'INSERT INTO detalles_pedido (pedido_id, plato_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, detalle.plato_id, detalle.cantidad, detalle.precio_unitario]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId, total });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error al crear pedido', error: error.message });
    } finally {
        connection.release();
    }
};

export const updatePedidoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'en_preparacion', 'listo', 'servido', 'pagado'
        
        await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: `Estado del pedido actualizado a: ${estado}` });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado del pedido', error: error.message });
    }
};

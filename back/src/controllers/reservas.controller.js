import pool from '../config/db.js';

export const getReservas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre as cliente, m.numero_mesa 
            FROM reservas r
            LEFT JOIN usuarios u ON r.usuario_id = u.id
            LEFT JOIN mesas m ON r.mesa_id = m.id
            ORDER BY r.fecha_hora ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
    }
};

export const createReserva = async (req, res) => {
    try {
        const { fecha_hora, mesa_id } = req.body;
        const usuario_id = req.usuario.id; // El ID viene del token JWT

        let mesaIdReal = null;
        if (mesa_id) {
            const [mesas] = await pool.query('SELECT id FROM mesas WHERE numero_mesa = ?', [mesa_id]);
            if (mesas.length > 0) {
                mesaIdReal = mesas[0].id;
            } else {
                const [insertMesa] = await pool.query('INSERT INTO mesas (numero_mesa, capacidad) VALUES (?, 4)', [mesa_id]);
                mesaIdReal = insertMesa.insertId;
            }
        }

        const [result] = await pool.query(
            'INSERT INTO reservas (usuario_id, mesa_id, fecha_hora) VALUES (?, ?, ?)',
            [usuario_id, mesaIdReal, fecha_hora]
        );
        res.status(201).json({ id: result.insertId, usuario_id, mesa_id, fecha_hora, estado: 'pendiente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear reserva', error: error.message });
    }
};

export const updateReservaStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'pendiente', 'confirmada', 'cancelada', 'completada'
        
        await pool.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Estado de reserva actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
    }
};

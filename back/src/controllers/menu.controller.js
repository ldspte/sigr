import pool from '../config/db.js';

// ---- CATEGORÍAS ----
export const getCategorias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

export const createCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const [result] = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        res.status(201).json({ id: result.insertId, nombre, descripcion });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría', error: error.message });
    }
};

// ---- PLATOS ----
export const getPlatos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM platos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener platos', error: error.message });
    }
};

export const createPlato = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria_id } = req.body;
        const [result] = await pool.query(
            'INSERT INTO platos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)', 
            [nombre, descripcion, precio, categoria_id]
        );
        res.status(201).json({ id: result.insertId, nombre, descripcion, precio, categoria_id });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear plato', error: error.message });
    }
};

export const updatePlatoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'disponible' o 'agotado'
        await pool.query('UPDATE platos SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Estado del plato actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar plato', error: error.message });
    }
};

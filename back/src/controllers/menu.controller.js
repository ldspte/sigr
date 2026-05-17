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
        const { estado } = req.body;
        
        await pool.query('UPDATE platos SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: 'Estado actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
    }
};

export const deletePlato = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM platos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        res.json({ message: 'Plato eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar plato', error: error.message });
    }
};

export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        // Puede fallar si hay platos asignados a esta categoría por la restricción de llave foránea
        res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
    }
};

import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Por favor llena todos los campos obligatorios' });
        }

        // Verificar si el usuario ya existe
        const [existingUsers] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Asignar rol (si mandan un rol inválido, por defecto será 'cliente')
        const userRol = ['cliente', 'mesero', 'administrador'].includes(rol) ? rol : 'cliente';

        // Insertar en la BD
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, userRol]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            usuarioId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar usuario' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor proporciona email y contraseña' });
        }

        // Buscar usuario en BD
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar Token JWT (Expira en 24 horas)
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET || 'sigr_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al hacer login' });
    }
};

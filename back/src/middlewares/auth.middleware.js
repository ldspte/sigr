import jwt from 'jsonwebtoken';

// Middleware para verificar el Token JWT
export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ message: 'No se proporcionó un token' });
        }

        // El token usualmente llega como "Bearer <token>"
        const tokenParts = token.split(' ');
        const tokenToVerify = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

        // Usamos una clave secreta por defecto si no hay una en el .env
        const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET || 'sigr_secret_key');
        req.usuario = decoded; // Guardamos la info del usuario (id, rol) en req
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};

// Middleware para verificar si es administrador
export const isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'administrador') {
        next();
    } else {
        return res.status(403).json({ message: 'Requiere rol de administrador' });
    }
};

// Middleware para verificar si es parte del staff (mesero o admin)
export const isStaff = (req, res, next) => {
    if (req.usuario && (req.usuario.rol === 'administrador' || req.usuario.rol === 'mesero')) {
        next();
    } else {
        return res.status(403).json({ message: 'Requiere permisos de staff (mesero o administrador)' });
    }
};

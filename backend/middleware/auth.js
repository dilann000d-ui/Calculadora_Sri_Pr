const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware para verificar token y rol
exports.auth = (roles = []) => {
  // roles puede ser un string o un array de strings
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Buscar el usuario real en la base de datos para obtener el _id
      let userDb = null;
      if (decoded.userId) {
        userDb = await User.findById(decoded.userId);
      } else if (decoded.username) {
        userDb = await User.findOne({ username: decoded.username });
      }
      if (!userDb) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }
      req.user = {
        ...decoded,
        _id: userDb._id,
        cedulaOrRuc: userDb.cedulaOrRuc,
        email: userDb.email,
        role: userDb.role,
        username: userDb.username
      };
      // Si se especifican roles, verificar que el usuario tenga el rol adecuado
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido', error: err.message });
    }
  };
};

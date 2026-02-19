const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  try {
    const { username, password, email, role, cedulaOrRuc } = req.body;
    if (!cedulaOrRuc) {
      return res.status(400).json({ message: 'Debe ingresar cédula o RUC' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role, cedulaOrRuc });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el registro', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Intento de login:', req.body);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Usuario no encontrado:', username);
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Contraseña incorrecta para usuario:', username);
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log('Login exitoso para usuario:', username);
    res.json({ token, user: { username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};


// Listar todos los usuarios (solo admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // No enviar contraseñas
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

// Editar usuario (solo admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { username, email, role },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
};
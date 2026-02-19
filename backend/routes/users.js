const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Registro de usuario
router.post('/register', usersController.register);
// Login de usuario
router.post('/login', usersController.login);


const { auth } = require('../middleware/auth');

// Ruta protegida: solo usuarios autenticados
router.get('/profile', auth(), (req, res) => {
	res.json({ message: 'Perfil de usuario', user: req.user });
});


// Panel de admin (ejemplo)
router.get('/admin', auth('admin'), (req, res) => {
	res.json({ message: 'Panel de administrador', user: req.user });
});

// Listar todos los usuarios (solo admin)
router.get('/', auth('admin'), usersController.getAllUsers);

// Editar usuario (solo admin)
router.put('/:id', auth('admin'), usersController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', auth('admin'), usersController.deleteUser);

module.exports = router;

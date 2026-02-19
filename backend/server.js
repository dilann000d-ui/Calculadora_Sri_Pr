const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const facturasRoutes = require('./routes/facturas');
const usersRoutes = require('./routes/users');

const app = express();

// Crear usuario admin por defecto si no existe
const User = require('./models/User');
const bcrypt = require('bcryptjs');
async function ensureAdminUser() {
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashed,
      role: 'admin',
      email: 'admin@sri.com',
      cedulaOrRuc: '9999999999',
      createdAt: new Date()
    });
    console.log('Usuario admin creado: admin / admin123');
  } else {
    console.log('Usuario admin ya existe');
  }
}

// CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas base
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Calculadora SRI - Servidor funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      facturas: '/api/facturas'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor en linea',
    timestamp: new Date().toISOString()
  });
});

// API
app.use('/api/facturas', facturasRoutes);
app.use('/api/users', usersRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.path
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
let server = null;

async function startServer() {
  try {
    await connectDB();
    await ensureAdminUser();

    server = app.listen(PORT, () => {
      console.log(`Servidor Node.js ejecutandose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;

const express = require('express');
const {
  crearFactura,
  obtenerFacturas,
  obtenerFacturaPorId,
  actualizarFactura,
  eliminarFactura,
  obtenerFacturasPorGasto,
} = require('../controllers/facturasController');

const { auth } = require('../middleware/auth');
const facturasController = require('../controllers/facturasController');
const router = express.Router();

// Obtener facturas del usuario autenticado
router.get('/mis-facturas', auth(), facturasController.obtenerFacturasPorUsuario);

// Rutas principales
router.post('/', auth('user'), crearFactura);
router.get('/', obtenerFacturas);
router.get('/gasto/:tipo', obtenerFacturasPorGasto);

// Rutas de estadisticas (solo admin)
router.get('/estadisticas/gastos', auth('admin'), facturasController.estadisticasPorGasto);
router.get('/estadisticas/por-dia', auth('admin'), facturasController.facturasPorDia);

// Rutas por id
router.get('/:id', obtenerFacturaPorId);
router.put('/:id', actualizarFactura);
router.delete('/:id', eliminarFactura);

module.exports = router;

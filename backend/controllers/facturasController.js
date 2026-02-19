// Obtener facturas del usuario autenticado (por cedulaUsuario)
exports.obtenerFacturasPorUsuario = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.cedulaOrRuc) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    const facturas = await Factura.find({ cedulaUsuario: user.cedulaOrRuc }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: facturas.length,
      data: facturas
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ========== ENDPOINTS DE ESTADÍSTICAS PARA ADMIN ==========

// Estadística: total de facturas y suma de valores por tipo de gasto
exports.estadisticasPorGasto = async (req, res) => {
  try {
    const stats = await Factura.aggregate([
      {
        $group: {
          _id: '$gasto',
          totalFacturas: { $sum: 1 },
          totalValor: { $sum: '$valor' },
          totalImpuesto: { $sum: '$impuesto' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Estadística: facturas por día (últimos 30 días)
exports.facturasPorDia = async (req, res) => {
  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    const stats = await Factura.aggregate([
      { $match: { createdAt: { $gte: desde } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalFacturas: { $sum: 1 },
          totalValor: { $sum: '$valor' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const Factura = require('../models/Factura');

// @desc    Crear una nueva factura
// @route   POST /api/facturas
// @access  Public
exports.crearFactura = async (req, res, next) => {
  try {
    console.log('POST /api/facturas body:', req.body);
    const { ruc, valor, gasto, descripcion } = req.body;
    // El usuario debe estar autenticado
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }
    if (!ruc || !valor || !gasto) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione todos los campos requeridos: ruc, valor, gasto',
      });
    }
    // Crear la factura asociada al usuario autenticado
    try {
      const factura = await Factura.create({
        userId: user._id || user.userId || user.id,
        cedulaUsuario: user.cedulaOrRuc, // Para reportes por usuario
        ruc,
        valor: parseFloat(valor),
        gasto,
        descripcion,
      });
      res.status(201).json({
        success: true,
        message: 'Factura registrada exitosamente',
        data: factura,
      });
    } catch (mongooseError) {
      console.error('Error al crear factura:', mongooseError);
      res.status(400).json({
        success: false,
        message: mongooseError.message,
        error: mongooseError,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// @desc    Obtener todas las facturas
// @route   GET /api/facturas
// @access  Public
exports.obtenerFacturas = async (req, res, next) => {
  try {
    const facturas = await Factura.find().sort({ createdAt: -1 });

    // Calcular totales
    const totalRegistros = facturas.length;
    const totalBase = facturas.reduce((sum, f) => sum + f.baseImponible, 0);
    const totalImpuesto = facturas.reduce((sum, f) => sum + f.impuesto, 0);

    res.status(200).json({
      success: true,
      message: 'Facturas obtenidas exitosamente',
      totalRegistros,
      totalBase: totalBase.toFixed(2),
      totalImpuesto: totalImpuesto.toFixed(2),
      data: facturas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener una factura por ID
// @route   GET /api/facturas/:id
// @access  Public
exports.obtenerFacturaPorId = async (req, res, next) => {
  try {
    const factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: factura,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Actualizar una factura
// @route   PUT /api/facturas/:id
// @access  Public
exports.actualizarFactura = async (req, res, next) => {
  try {
    const { ruc, valor, gasto, descripcion } = req.body;

    let factura = await Factura.findById(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    // Actualizar campos
    if (ruc) factura.ruc = ruc;
    if (valor) factura.valor = parseFloat(valor);
    if (gasto) factura.gasto = gasto;
    if (descripcion) factura.descripcion = descripcion;

    factura = await factura.save();

    res.status(200).json({
      success: true,
      message: 'Factura actualizada exitosamente',
      data: factura,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Eliminar una factura
// @route   DELETE /api/facturas/:id
// @access  Public
exports.eliminarFactura = async (req, res, next) => {
  try {
    const factura = await Factura.findByIdAndDelete(req.params.id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Factura eliminada exitosamente',
      data: factura,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtener facturas por tipo de gasto
// @route   GET /api/facturas/gasto/:tipo
// @access  Public
exports.obtenerFacturasPorGasto = async (req, res, next) => {
  try {
    const { tipo } = req.params;
    const facturas = await Factura.find({ gasto: tipo }).sort({ createdAt: -1 });

    const totalBase = facturas.reduce((sum, f) => sum + f.baseImponible, 0);
    const totalImpuesto = facturas.reduce((sum, f) => sum + f.impuesto, 0);

    res.status(200).json({
      success: true,
      tipo,
      totalRegistros: facturas.length,
      totalBase: totalBase.toFixed(2),
      totalImpuesto: totalImpuesto.toFixed(2),
      data: facturas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const mongoose = require('mongoose');

const facturasSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cedulaUsuario: {
    type: String,
    required: false,
    trim: true,
    default: '',
  },
  ruc: {
    type: String,
    required: [true, 'El RUC es requerido'],
    trim: true,
    match: [/^\d{13}$/, 'El RUC debe tener 13 dígitos'],
  },
    valor: {
      type: Number,
      required: [true, 'El valor es requerido'],
      min: [0.01, 'El valor debe ser mayor a 0'],
    },
    gasto: {
      type: String,
      required: [true, 'El tipo de gasto es requerido'],
      enum: ['Vivienda', 'Salud', 'Educación'],
    },
    impuesto: {
      type: Number,
      required: true,
      default: 0,
    },
    baseImponible: {
      type: Number,
      required: true,
      default: 0,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para calcular impuesto antes de guardar
facturasSchema.pre('save', function (next) {
  // Calcular base imponible (el valor ingresado)
  this.baseImponible = this.valor;
  
  // Calcular impuesto del 12% sobre la base imponible
  this.impuesto = this.baseImponible * 0.12;
  
  next();
});

module.exports = mongoose.model('Factura', facturasSchema);

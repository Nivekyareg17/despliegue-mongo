const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del producto es obligatorio"],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio no puede ser un numero negativo"]
    },
    stock: {
        type: Number,
        default: 0
    },
    categoria: {
        type: mongoose.Schema.Types.Mixed,
        default: "General"
    },
    proveedor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    estado: {
        type: String,
        enum: ['pendiente', 'procesado', 'finalizado'],
        default: 'pendiente'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);

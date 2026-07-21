const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del proveedor es obligatorio"],
        trim: true
    },
    nit: {
        type: String, 
        required: [true, "El NIT de la empresa es obligatorio"],
        trim: true
    },
    correo: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        trim: true,
        lowercase: true
    },
    telefono: {
        type: Number, 
        required: [true, "El teléfono de contacto es obligatorio"]
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
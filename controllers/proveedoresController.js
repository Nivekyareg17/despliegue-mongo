const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del proveedor es obligatorio"],
        trim: true
    },
    nit: {
        // Se recomienda String para NITs/Documentos por si llevan guiones o ceros a la izquierda
        type: String, 
        required: [true, "El NIT de la empresa es obligatorio"],
        trim: true
    },
    correo: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        trim: true,
        lowercase: true // Mongoose convertirá automáticamente el correo a minúsculas
    },
    telefono: {
        type: Number, // En tu JSON lo pasaste como número, así que lo mantenemos igual
        required: [true, "El teléfono de contacto es obligatorio"]
    }
}, {
    // Esto creará automáticamente los campos 'createdAt' y 'updatedAt'
    timestamps: true 
});

// Mongoose pluralizará esto automáticamente y buscará la colección 'proveedores'
module.exports = mongoose.model('Proveedor', proveedorSchema);
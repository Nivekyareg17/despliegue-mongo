const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); 

// GET - Consultar catálogo completo de proveedores
router.get('/proveedores', async (req, res) => {
    try {
        const proveedores = await mongoose.connection.db.collection('proveedores').find({}).toArray();
        res.json(proveedores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los proveedores" });
    }
});

// POST - Crear un nuevo proveedor
router.post('/proveedores', async (req, res) => {
    try {
        const nuevoProveedor = req.body;

        // VALIDACIÓN CORREGIDA: Exigimos nombre y correo (no email)
        if (!nuevoProveedor.nombre || !nuevoProveedor.correo) {
            return res.status(400).json({
                error: "Formato invalido, el nombre y el correo son obligatorios"
            });
        }

        const resultado = await mongoose.connection.db.collection('proveedores').insertOne(nuevoProveedor);

        res.status(201).json({
            mensaje: "Proveedor registrado exitosamente",
            id_generado: resultado.insertedId,
            datosGuardados: nuevoProveedor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error critico al guardar el proveedor" });
    }
});

// PUT - Actualizar un proveedor por ID usando $set
router.put('/proveedores/:id', async (req, res) => {
    try {
        const idProveedor = req.params.id;
        const datosNuevos = req.body;

        const resultado = await mongoose.connection.db.collection('proveedores').updateOne(
            { _id: new ObjectId(idProveedor) }, 
            { $set: datosNuevos } 
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado en la BD" });
        }

        res.json({
            mensaje: "Datos del proveedor actualizados correctamente", 
            modificaciones: resultado.modifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo actualizar el proveedor" });
    }
});

// DELETE - Eliminar físicamente un proveedor por ID
router.delete('/proveedores/:id', async (req, res) => {
    try {
        const idProveedor = req.params.id;
        const resultado = await mongoose.connection.db.collection('proveedores').deleteOne({
            _id: new ObjectId(idProveedor)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Proveedor eliminado correctamente del sistema" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo eliminar el proveedor" });
    }
});

module.exports = router;
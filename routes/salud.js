const express = require('express');
const router = express.Router();
// IMPORTANTE: Importar Mongoose y el ObjectId para poder buscar por ID en Mongo
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); 

// Endpoint de Salud (Asegúrate de agregarle la barra '/' al inicio)
router.get('/health', (req, res) => {
    res.status(200).json({
        estado: "Servidor funcionando", 
        Timestamp: new Date().toISOString()
    });
});

// GET - Consultar catálogo completo
router.get('/api/productos', async (req, res) => {
    try {
        const productos = await mongoose.connection.db.collection('productos').find({}).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar los productos" });
    }
});

// POST - Crear un nuevo producto
router.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = req.body;

        if (!nuevoProducto.nombre || !nuevoProducto.precio) {
            return res.status(400).json({
                error: "Formato invalido, el precio y el nombre son obligatorios"
            });
        }

        const resultado = await mongoose.connection.db.collection('productos').insertOne(nuevoProducto);

        res.status(201).json({
            mensaje: "Producto creado",
            id_generado: resultado.insertedId,
            datosGuardados: nuevoProducto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error critico al guardar el producto" });
    }
});

// PUT - Actualizar un producto por ID usando $set
router.put('/api/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const datosNuevos = req.body;

        const resultado = await mongoose.connection.db.collection('productos').updateOne(
            { _id: new ObjectId(idProducto) }, 
            { $set: datosNuevos } 
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD" });
        }

        res.json({
            mensaje: "Producto actualizado correctamente", 
            modificaciones: resultado.modifiedCount
        });
    } catch (error) {
        console.error(error);
        // CORREGIDO: De 'resultado.status' a 'res.status'
        res.status(500).json({ error: "No se pudo actualizar el producto" });
    }
});

// DELETE - Eliminar físicamente un producto por ID
router.delete('/api/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const resultado = await mongoose.connection.db.collection('productos').deleteOne({
            _id: new ObjectId(idProducto)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        // CORREGIDO: De 'resultado.status' a 'res.status'
        res.status(500).json({ error: "No se pudo eliminar el producto" });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
// IMPORTANTE: Importar Mongoose y el ObjectId para poder buscar por ID en Mongo
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); 

// Endpoint de Salud -> URL Final: /api/v1/health
router.get('/health', (req, res) => {
    res.status(200).json({
        estado: "Servidor funcionando", 
        Timestamp: new Date().toISOString()
    });
});

// GET - Consultar catálogo completo -> URL Final: /api/v1/productos
router.get('/productos', async (req, res) => {
    try {
        // Validación de Cold Start en Vercel
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ Vercel despertando: Esperando conexión a MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
        }

        const productos = await mongoose.connection.db.collection('productos').find({}).toArray();
        res.json(productos);
    } catch (error) {
        console.error("Error real:", error);
        res.status(500).json({ 
            error: "Error al consultar los productos", 
            detalle: error.message 
        });
    }
});

// POST - Crear un nuevo producto -> URL Final: /api/v1/productos
router.post('/productos', async (req, res) => {
    try {
        // Validación de Cold Start en Vercel
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ Vercel despertando: Esperando conexión a MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
        }

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
        console.error("Error real:", error);
        res.status(500).json({ 
            error: "Error critico al guardar el producto",
            detalle: error.message 
        });
    }
});

// PUT - Actualizar un producto por ID usando $set -> URL Final: /api/v1/productos/:id
router.put('/productos/:id', async (req, res) => {
    try {
        // Validación de Cold Start en Vercel
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ Vercel despertando: Esperando conexión a MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
        }

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
        console.error("Error real:", error);
        res.status(500).json({ 
            error: "No se pudo actualizar el producto",
            detalle: error.message 
        });
    }
});

// DELETE - Eliminar físicamente un producto por ID -> URL Final: /api/v1/productos/:id
router.delete('/productos/:id', async (req, res) => {
    try {
        // Validación de Cold Start en Vercel
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ Vercel despertando: Esperando conexión a MongoDB...");
            await mongoose.connect(process.env.MONGO_URI);
        }

        const idProducto = req.params.id;
        const resultado = await mongoose.connection.db.collection('productos').deleteOne({
            _id: new ObjectId(idProducto)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error real:", error);
        res.status(500).json({ 
            error: "No se pudo eliminar el producto",
            detalle: error.message 
        });
    }
});

module.exports = router;
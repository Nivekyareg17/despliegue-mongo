const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const productosCollection = () => mongoose.connection.db.collection('productos');
const proveedoresCollection = () => mongoose.connection.db.collection('proveedores');

const esObjectIdValido = (id) => ObjectId.isValid(id);

const convertirProveedorId = async (proveedorId) => {
    if (!proveedorId) return null;

    if (!esObjectIdValido(proveedorId)) {
        const error = new Error("El proveedor_id no tiene un formato valido");
        error.status = 400;
        throw error;
    }

    const proveedorObjectId = new ObjectId(proveedorId);
    const proveedorExiste = await proveedoresCollection().findOne({ _id: proveedorObjectId });

    if (!proveedorExiste) {
        const error = new Error("El proveedor indicado no existe en la coleccion proveedores");
        error.status = 404;
        throw error;
    }

    return proveedorObjectId;
};

const consultarProductosConProveedor = (filtro = {}) => productosCollection().aggregate([
    { $match: filtro },
    {
        $lookup: {
            from: 'proveedores',
            localField: 'proveedor_id',
            foreignField: '_id',
            as: 'proveedor'
        }
    },
    {
        $unwind: {
            path: '$proveedor',
            preserveNullAndEmptyArrays: true
        }
    }
]).toArray();

router.get('/health', (req, res) => {
    res.status(200).json({
        estado: "Servidor funcionando",
        Timestamp: new Date().toISOString()
    });
});

router.get('/productos', async (req, res) => {
    try {
        const productos = await consultarProductosConProveedor();
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los productos" });
    }
});

router.get('/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;

        if (!esObjectIdValido(idProducto)) {
            return res.status(400).json({ error: "El id del producto no tiene un formato valido" });
        }

        const productos = await consultarProductosConProveedor({ _id: new ObjectId(idProducto) });

        if (productos.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD" });
        }

        res.json(productos[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar el producto" });
    }
});

router.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = req.body;

        if (!nuevoProducto.nombre || !nuevoProducto.precio) {
            return res.status(400).json({
                error: "Formato invalido, el precio y el nombre son obligatorios"
            });
        }

        nuevoProducto.estado = nuevoProducto.estado || "pendiente";

        if (nuevoProducto.proveedor_id) {
            nuevoProducto.proveedor_id = await convertirProveedorId(nuevoProducto.proveedor_id);
        }

        const resultado = await productosCollection().insertOne(nuevoProducto);

        res.status(201).json({
            mensaje: "Producto creado",
            id_generado: resultado.insertedId,
            datosGuardados: nuevoProducto
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message || "Error critico al guardar el producto" });
    }
});

router.put('/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const datosNuevos = req.body;

        if (!esObjectIdValido(idProducto)) {
            return res.status(400).json({ error: "El id del producto no tiene un formato valido" });
        }

        if (datosNuevos.proveedor_id) {
            datosNuevos.proveedor_id = await convertirProveedorId(datosNuevos.proveedor_id);
        }

        const resultado = await productosCollection().updateOne(
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
        res.status(error.status || 500).json({ error: error.message || "No se pudo actualizar el producto" });
    }
});

router.delete('/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;

        if (!esObjectIdValido(idProducto)) {
            return res.status(400).json({ error: "El id del producto no tiene un formato valido" });
        }

        const resultado = await productosCollection().deleteOne({
            _id: new ObjectId(idProducto)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo eliminar el producto" });
    }
});

router.patch('/actualizar-estado/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const { estado_nuevo } = req.body;

        if (!esObjectIdValido(idProducto)) {
            return res.status(400).json({ error: "El id del producto no tiene un formato valido" });
        }

        const producto = await productosCollection().findOne({
            _id: new ObjectId(idProducto)
        });

        if (!producto) {
            return res.status(404).json({ error: "El producto no existe en la base de datos." });
        }

        if (producto.estado === 'finalizado') {
            return res.status(403).json({
                error: "Prohibido: El producto ya se encuentra 'finalizado' y su estado es inmodificable."
            });
        }

        await productosCollection().updateOne(
            { _id: new ObjectId(idProducto) },
            { $set: { estado: estado_nuevo } }
        );

        res.json({
            mensaje: "Estado actualizado exitosamente",
            estado_anterior: producto.estado || "sin estado",
            estado_actual: estado_nuevo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno al intentar actualizar el estado" });
    }
});

router.get('/proveedores/:id/productos', async (req, res) => {
    try {
        const idProveedor = req.params.id;

        if (!esObjectIdValido(idProveedor)) {
            return res.status(400).json({ error: "El id del proveedor no tiene un formato valido" });
        }

        const proveedorObjectId = new ObjectId(idProveedor);
        const proveedor = await proveedoresCollection().findOne({ _id: proveedorObjectId });

        if (!proveedor) {
            return res.status(404).json({ error: "Proveedor no encontrado en la BD" });
        }

        const productos = await productosCollection().find({ proveedor_id: proveedorObjectId }).toArray();

        res.json({
            proveedor,
            productos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los productos del proveedor" });
    }
});

module.exports = router;

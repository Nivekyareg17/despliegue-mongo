const Producto = require("../modules/Producto");

// [GET] - Obtener todos los productos
const obtenerProducto = async (req, res) => {
    try {
        const productos = await Producto.find().populate('proveedor_id');
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los productos" });
    }
};

// [POST] - Crear un nuevo producto
const crearProducto = async (req, res) => {
    try {
        // Mongoose se encarga automáticamente de validar los datos contra tu Schema
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        
        res.status(201).json({
            mensaje: "Producto creado exitosamente",
            producto: productoGuardado
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error de validación al crear el producto", detalle: error.message });
    }
};

// [PUT] - Actualizar producto completo
const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            // new: true devuelve el doc actualizado, runValidators fuerza a respetar el Schema
            { new: true, runValidators: true } 
        ).populate('proveedor_id');
        
        if (!productoActualizado) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(productoActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar." });
    }
};

// [DELETE] - Eliminar un producto
const eliminarProducto = async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        
        if (!productoEliminado) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
};

// ==========================================
// 🔥 RETO ADICIONAL: [PATCH] Actualizar Estado
// ==========================================
const actualizarEstadoProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_nuevo } = req.body;

        // 1. Consultar si el recurso existe (lo buscamos completo primero)
        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).json({ error: "El producto no existe en la base de datos." });
        }

        // 2. Condición de negocio estricta
        if (producto.estado === 'finalizado') {
            return res.status(403).json({ 
                error: "Prohibido: El producto ya se encuentra 'finalizado' y su estado es inmodificable." 
            });
        }

        // Guardamos el estado anterior solo para mostrarlo en el mensaje final
        const estadoAnterior = producto.estado;

        // 3. Si pasó la validación, actualizamos el campo y guardamos
        producto.estado = estado_nuevo;
        await producto.save(); // Al usar .save(), Mongoose verifica que el estado exista en el enum

        res.json({ 
            mensaje: "Estado actualizado exitosamente",
            estado_anterior: estadoAnterior,
            estado_actual: producto.estado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno al intentar actualizar el estado", detalle: error.message });
    }
};

// Exportar todos los métodos
module.exports = {
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarEstadoProducto
};

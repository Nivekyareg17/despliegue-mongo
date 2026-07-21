const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose'); 

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Conexión exitosa a la base de datos en MongoDB Atlas'))
    .catch((error) => console.error('❌ Error crítico al conectar a MongoDB:', error));

const middlewareRevision = (req, res, next) => {
    const horaActual = new Date().toLocaleDateString();
    console.log(`[${horaActual}] petición ${req.method} ${req.url}`);
    next();
};

app.use(middlewareRevision);

// 1. IMPORTAR LAS RUTAS
const healthRoutes = require('./routes/salud');
const productosRoutes = require('./routes/productos'); 
const proveedoresRoutes = require('./routes/proveedores');// <-- Agregada la importación de usuarios

// 2. REGISTRAR LAS RUTAS CON LA '/' INICIAL CORRECTA
app.use('/api/v1', healthRoutes);
app.use('/api/v1', productosRoutes); 
app.use('/api/v1', proveedoresRoutes);// <-- Agregado el registro para que Express las reconozca

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`El backend está escuchando en localhost:${PORT}`);
});
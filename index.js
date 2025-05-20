const express = require('express');
const cors = require('cors');

// Importación de las rutas de cada tabla
const usuarioRoutes = require('./routes/usuarioRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const conductorRoutes = require('./routes/conductorRoutes');
const asignacionVehiculoRoutes = require('./routes/asignacionVehiculoRoutes');
const historialViajeRoutes = require('./routes/historialViajeRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const inspeccionTecnicaRoutes = require('./routes/inspeccionTecnicaRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const reporteCombustibleRoutes = require('./routes/reporteCombustibleRoutes');  // Nueva ruta para reportes de combustible

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas para manejar las tablas
app.use('/usuarios', usuarioRoutes);
app.use('/vehiculos', vehiculoRoutes);
app.use('/conductores', conductorRoutes);
app.use('/asignaciones', asignacionVehiculoRoutes);
app.use('/historial-viajes', historialViajeRoutes);
app.use('/mantenimientos', mantenimientoRoutes);
app.use('/inspecciones-tecnicas', inspeccionTecnicaRoutes);
app.use('/alertas', alertaRoutes);
app.use('/reportes-combustible', reporteCombustibleRoutes);  // Ruta para reportes de combustible

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});


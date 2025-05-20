// controllers/mantenimientoController.js
const mantenimientoService = require('../services/mantenimientoService');

// Obtener todos los mantenimientos
async function getMantenimientos(req, res) {
  try {
    const mantenimientos = await mantenimientoService.getMantenimientos();
    res.status(200).json(mantenimientos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Obtener un mantenimiento por ID
async function getMantenimientoById(req, res) {
  const id = req.params.id;
  try {
    const mantenimiento = await mantenimientoService.getMantenimientoById(id);
    res.status(200).json(mantenimiento);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Crear un nuevo mantenimiento
async function createMantenimiento(req, res) {
  const { vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados } = req.body;
  try {
    const response = await mantenimientoService.createMantenimiento(vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Actualizar un mantenimiento
async function updateMantenimiento(req, res) {
  const id = req.params.id;
  const { vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados } = req.body;
  try {
    const response = await mantenimientoService.updateMantenimiento(id, vehiculoId, tipoMantenimiento, fechaMantenimiento, kilometrajeMantenimiento, descripcion, estado, costoTotal, repuestosUsados);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Eliminar un mantenimiento
async function deleteMantenimiento(req, res) {
  const id = req.params.id;
  try {
    const response = await mantenimientoService.deleteMantenimiento(id);
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getMantenimientos,
  getMantenimientoById,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento
};


const inspeccionTecnicaService = require('../services/inspeccionTecnicaService');

// Obtener todas las inspecciones técnicas
async function getInspeccionesTecnicas(req, res) {
  try {
    const inspecciones = await inspeccionTecnicaService.getInspeccionesTecnicas();
    res.json(inspecciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Obtener una inspección técnica por ID
async function getInspeccionTecnicaById(req, res) {
  try {
    const id = req.params.id;
    const inspeccion = await inspeccionTecnicaService.getInspeccionTecnicaById(id);
    res.json(inspeccion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear una nueva inspección técnica
async function createInspeccionTecnica(req, res) {
  const { vehiculoId, fechaInspeccion, tipoInspeccion, estado } = req.body;
  try {
    const response = await inspeccionTecnicaService.createInspeccionTecnica(vehiculoId, fechaInspeccion, tipoInspeccion, estado);
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualizar una inspección técnica
async function updateInspeccionTecnica(req, res) {
  const id = req.params.id;
  const { vehiculoId, fechaInspeccion, tipoInspeccion, estado } = req.body;
  try {
    const response = await inspeccionTecnicaService.updateInspeccionTecnica(id, vehiculoId, fechaInspeccion, tipoInspeccion, estado);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar una inspección técnica
async function deleteInspeccionTecnica(req, res) {
  const id = req.params.id;
  try {
    const response = await inspeccionTecnicaService.deleteInspeccionTecnica(id);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getInspeccionesTecnicas,
  getInspeccionTecnicaById,
  createInspeccionTecnica,
  updateInspeccionTecnica,
  deleteInspeccionTecnica
};


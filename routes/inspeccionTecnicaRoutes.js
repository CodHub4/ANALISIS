const express = require('express');
const router = express.Router();
const inspeccionTecnicaController = require('../controllers/inspeccionTecnicaController');

// Rutas de inspección técnica
router.get('/', inspeccionTecnicaController.getInspeccionesTecnicas);
router.get('/:id', inspeccionTecnicaController.getInspeccionTecnicaById);
router.post('/', inspeccionTecnicaController.createInspeccionTecnica);
router.put('/:id', inspeccionTecnicaController.updateInspeccionTecnica);
router.delete('/:id', inspeccionTecnicaController.deleteInspeccionTecnica);

module.exports = router;



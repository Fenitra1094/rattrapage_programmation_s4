const express = require('express');
const router = express.Router();
const prixVentePouletsController = require('../controllers/prixVentePouletsController');

router.get('/', prixVentePouletsController.getAll);
router.get('/race/:id_race/latest', prixVentePouletsController.getLatestByRace);
router.get('/race/:id_race', prixVentePouletsController.getByRace);
router.get('/:id', prixVentePouletsController.getById);
router.post('/', prixVentePouletsController.create);
router.put('/:id', prixVentePouletsController.update);
router.delete('/:id', prixVentePouletsController.delete);

module.exports = router;

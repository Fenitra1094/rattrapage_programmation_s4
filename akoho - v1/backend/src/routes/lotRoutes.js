const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lotController');

router.get('/', lotController.getAll);
router.get('/details', lotController.getAllWithDetails);
router.get('/race/:id_race', lotController.getByRace);
router.get('/:id', lotController.getById);
router.get('/:id/stock', lotController.getStock);
router.get('/:id/stock-oeufs', lotController.getStockOeufs);
router.get('/:id/age', lotController.getAgeActuel);
router.get('/:id/poids', lotController.estimerPoids);
router.get('/:id/consommation-nourriture', lotController.getConsommationNourriture);
router.post('/', lotController.create);
router.post('/:id/eclore', lotController.faireEclore);
router.put('/:id', lotController.update);
router.delete('/:id', lotController.delete);

module.exports = router;

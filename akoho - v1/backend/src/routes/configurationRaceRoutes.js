const express = require('express');
const router = express.Router();
const configurationRaceController = require('../controllers/configurationRaceController');

router.get('/', configurationRaceController.getAll);
router.get('/race/:id_race/poids/:num_semaine', configurationRaceController.estimerPoids);
router.get('/race/:id_race/consommation/:num_semaine', configurationRaceController.estimerConsommation);
router.get('/race/:id_race', configurationRaceController.getByRace);
router.get('/:id', configurationRaceController.getById);
router.post('/', configurationRaceController.create);
router.put('/:id', configurationRaceController.update);
router.delete('/:id', configurationRaceController.delete);

module.exports = router;

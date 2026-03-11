const express = require('express');
const router = express.Router();
const prixVenteOeufsController = require('../controllers/prixVenteOeufsController');

router.get('/', prixVenteOeufsController.getAll);
router.get('/race/:id_race/latest', prixVenteOeufsController.getLatestByRace);
router.get('/race/:id_race', prixVenteOeufsController.getByRace);
router.get('/:id', prixVenteOeufsController.getById);
router.post('/', prixVenteOeufsController.create);
router.put('/:id', prixVenteOeufsController.update);
router.delete('/:id', prixVenteOeufsController.delete);

module.exports = router;

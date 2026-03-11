const express = require('express');
const router = express.Router();
const prixNourritureController = require('../controllers/prixNourritureController');

router.get('/', prixNourritureController.getAll);
router.get('/race/:id_race/latest', prixNourritureController.getLatestByRace);
router.get('/race/:id_race', prixNourritureController.getByRace);
router.get('/:id', prixNourritureController.getById);
router.post('/', prixNourritureController.create);
router.put('/:id', prixNourritureController.update);
router.delete('/:id', prixNourritureController.delete);

module.exports = router;

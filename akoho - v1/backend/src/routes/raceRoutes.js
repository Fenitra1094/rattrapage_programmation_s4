const express = require('express');
const router = express.Router();
const raceController = require('../controllers/raceController');

router.get('/', raceController.getAll);
router.get('/summary', raceController.getAllWithSummary);
router.get('/:id', raceController.getById);
router.get('/:id/details', raceController.getWithDetails);
router.post('/', raceController.create);
router.put('/:id', raceController.update);
router.delete('/:id', raceController.delete);

module.exports = router;

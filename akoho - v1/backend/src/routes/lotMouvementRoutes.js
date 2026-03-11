const express = require('express');
const router = express.Router();
const lotMouvementController = require('../controllers/lotMouvementController');

router.get('/', lotMouvementController.getAll);
router.get('/lot/:id_lot', lotMouvementController.getByLot);
router.get('/:id', lotMouvementController.getById);
router.post('/', lotMouvementController.create);
router.put('/:id', lotMouvementController.update);
router.delete('/:id', lotMouvementController.delete);

module.exports = router;

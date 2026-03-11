const express = require('express');
const router = express.Router();
const oeufMouvementController = require('../controllers/oeufMouvementController');

router.get('/', oeufMouvementController.getAll);
router.get('/lot/:id_lot', oeufMouvementController.getByLot);
router.get('/:id', oeufMouvementController.getById);
router.post('/', oeufMouvementController.create);
router.put('/:id', oeufMouvementController.update);
router.delete('/:id', oeufMouvementController.delete);

module.exports = router;

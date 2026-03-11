const express = require('express');
const router = express.Router();
const raisonMouvementController = require('../controllers/raisonMouvementController');

router.get('/', raisonMouvementController.getAll);
router.get('/:id', raisonMouvementController.getById);
router.post('/', raisonMouvementController.create);
router.put('/:id', raisonMouvementController.update);
router.delete('/:id', raisonMouvementController.delete);

module.exports = router;

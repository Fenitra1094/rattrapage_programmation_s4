const express = require('express');
const router = express.Router();
const fournisseurController = require('../controllers/fournisseurController');

router.get('/', fournisseurController.getAll);
router.get('/:id', fournisseurController.getById);
router.get('/:id/achats', fournisseurController.getAchats);
router.post('/', fournisseurController.create);
router.put('/:id', fournisseurController.update);
router.delete('/:id', fournisseurController.delete);

module.exports = router;

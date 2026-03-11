const express = require('express');
const router = express.Router();
const { venteOeufController, venteOeufDetailController } = require('../controllers/venteOeufController');

// Routes vente oeufs (mère)
router.get('/', venteOeufController.getAll);
router.get('/chiffre-affaires', venteOeufController.getChiffreAffaires);
router.get('/client/:id_client', venteOeufController.getByClient);
router.get('/:id', venteOeufController.getById);
router.post('/', venteOeufController.create);
router.put('/:id', venteOeufController.update);
router.delete('/:id', venteOeufController.delete);

// Routes détails vente oeufs (filles)
router.get('/details/all', venteOeufDetailController.getAll);
router.get('/details/:id', venteOeufDetailController.getById);
router.post('/details', venteOeufDetailController.create);
router.put('/details/:id', venteOeufDetailController.update);
router.delete('/details/:id', venteOeufDetailController.delete);

module.exports = router;

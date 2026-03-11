const express = require('express');
const router = express.Router();
const { ventePouletController, ventePouletDetailController } = require('../controllers/ventePouletController');

// Routes vente poulets (mère)
router.get('/', ventePouletController.getAll);
router.get('/chiffre-affaires', ventePouletController.getChiffreAffaires);
router.get('/client/:id_client', ventePouletController.getByClient);
router.get('/:id', ventePouletController.getById);
router.post('/', ventePouletController.create);
router.put('/:id', ventePouletController.update);
router.delete('/:id', ventePouletController.delete);

// Routes détails vente poulets (filles)
router.get('/details/all', ventePouletDetailController.getAll);
router.get('/details/:id', ventePouletDetailController.getById);
router.post('/details', ventePouletDetailController.create);
router.put('/details/:id', ventePouletDetailController.update);
router.delete('/details/:id', ventePouletDetailController.delete);

module.exports = router;

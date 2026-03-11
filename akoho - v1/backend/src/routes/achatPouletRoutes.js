const express = require('express');
const router = express.Router();
const achatPouletController = require('../controllers/achatPouletController');

router.get('/', achatPouletController.getAll);
router.get('/lot/:id_lot/cout', achatPouletController.getCoutTotalByLot);
router.get('/lot/:id_lot', achatPouletController.getByLot);
router.get('/fournisseur/:id_fournisseur', achatPouletController.getByFournisseur);
router.get('/:id', achatPouletController.getById);
router.post('/', achatPouletController.create);
router.put('/:id', achatPouletController.update);
router.delete('/:id', achatPouletController.delete);

module.exports = router;

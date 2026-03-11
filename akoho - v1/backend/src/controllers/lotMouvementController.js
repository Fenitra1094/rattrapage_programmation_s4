const LotMouvement = require('../models/LotMouvement');

const lotMouvementController = {
    async getAll(req, res) {
        try {
            const mouvements = await LotMouvement.getAll();
            res.json(mouvements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const mouvement = await LotMouvement.getById(req.params.id);
            if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { quantite, reference, remarque, id_lot, id_raison_mouvement } = req.body;
            if (quantite == null || !id_lot || !id_raison_mouvement) {
                return res.status(400).json({ message: 'quantite, id_lot et id_raison_mouvement sont requis' });
            }
            const mouvement = await LotMouvement.create({ quantite, reference, remarque, id_lot, id_raison_mouvement });
            res.status(201).json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { quantite, reference, remarque, id_lot, id_raison_mouvement } = req.body;
            if (quantite == null || !id_lot || !id_raison_mouvement) {
                return res.status(400).json({ message: 'quantite, id_lot et id_raison_mouvement sont requis' });
            }
            const mouvement = await LotMouvement.update(req.params.id, { quantite, reference, remarque, id_lot, id_raison_mouvement });
            if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await LotMouvement.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json({ message: 'Mouvement supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByLot(req, res) {
        try {
            const mouvements = await LotMouvement.getByLot(req.params.id_lot);
            res.json(mouvements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = lotMouvementController;

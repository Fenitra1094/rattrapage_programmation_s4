const RaisonMouvement = require('../models/RaisonMouvement');

const raisonMouvementController = {
    async getAll(req, res) {
        try {
            const raisons = await RaisonMouvement.getAll();
            res.json(raisons);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const raison = await RaisonMouvement.getById(req.params.id);
            if (!raison) return res.status(404).json({ message: 'Raison non trouvée' });
            res.json(raison);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { libelle } = req.body;
            if (!libelle) return res.status(400).json({ message: 'Le libellé est requis' });
            const raison = await RaisonMouvement.create(libelle);
            res.status(201).json(raison);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { libelle } = req.body;
            if (!libelle) return res.status(400).json({ message: 'Le libellé est requis' });
            const raison = await RaisonMouvement.update(req.params.id, libelle);
            if (!raison) return res.status(404).json({ message: 'Raison non trouvée' });
            res.json(raison);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await RaisonMouvement.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Raison non trouvée' });
            res.json({ message: 'Raison supprimée' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = raisonMouvementController;

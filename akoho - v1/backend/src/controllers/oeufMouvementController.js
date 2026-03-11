const OeufMouvement = require('../models/OeufMouvement');

const oeufMouvementController = {
    async getAll(req, res) {
        try {
            const mouvements = await OeufMouvement.getAll();
            res.json(mouvements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const mouvement = await OeufMouvement.getById(req.params.id);
            if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { quantite, reference, remarque, id_raison_mouvement, id_lot } = req.body;
            if (quantite == null || !id_raison_mouvement || !id_lot) {
                return res.status(400).json({ message: 'quantite, id_raison_mouvement et id_lot sont requis' });
            }
            const mouvement = await OeufMouvement.create({ quantite, reference, remarque, id_raison_mouvement, id_lot });
            res.status(201).json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { quantite, reference, remarque, id_raison_mouvement, id_lot } = req.body;
            if (quantite == null || !id_raison_mouvement || !id_lot) {
                return res.status(400).json({ message: 'quantite, id_raison_mouvement et id_lot sont requis' });
            }
            const mouvement = await OeufMouvement.update(req.params.id, { quantite, reference, remarque, id_raison_mouvement, id_lot });
            if (!mouvement) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json(mouvement);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await OeufMouvement.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Mouvement non trouvé' });
            res.json({ message: 'Mouvement supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByLot(req, res) {
        try {
            const mouvements = await OeufMouvement.getByLot(req.params.id_lot);
            res.json(mouvements);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = oeufMouvementController;

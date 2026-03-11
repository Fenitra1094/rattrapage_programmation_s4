const AchatPoulet = require('../models/AchatPoulet');

const achatPouletController = {
    async getAll(req, res) {
        try {
            const achats = await AchatPoulet.getAll();
            res.json(achats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const achat = await AchatPoulet.getById(req.params.id);
            if (!achat) return res.status(404).json({ message: 'Achat non trouvé' });
            res.json(achat);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { quantite, prix_unitaire, id_fournisseur, id_lot } = req.body;
            if (quantite == null || prix_unitaire == null || !id_fournisseur || !id_lot) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_fournisseur et id_lot sont requis' });
            }
            const achat = await AchatPoulet.create({ quantite, prix_unitaire, id_fournisseur, id_lot });
            res.status(201).json(achat);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { quantite, prix_unitaire, id_fournisseur, id_lot } = req.body;
            if (quantite == null || prix_unitaire == null || !id_fournisseur || !id_lot) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_fournisseur et id_lot sont requis' });
            }
            const achat = await AchatPoulet.update(req.params.id, { quantite, prix_unitaire, id_fournisseur, id_lot });
            if (!achat) return res.status(404).json({ message: 'Achat non trouvé' });
            res.json(achat);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await AchatPoulet.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Achat non trouvé' });
            res.json({ message: 'Achat supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByLot(req, res) {
        try {
            const achats = await AchatPoulet.getByLot(req.params.id_lot);
            res.json(achats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByFournisseur(req, res) {
        try {
            const achats = await AchatPoulet.getByFournisseur(req.params.id_fournisseur);
            res.json(achats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getCoutTotalByLot(req, res) {
        try {
            const cout = await AchatPoulet.getCoutTotalByLot(req.params.id_lot);
            res.json(cout);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = achatPouletController;

const Fournisseur = require('../models/Fournisseur');

const fournisseurController = {
    async getAll(req, res) {
        try {
            const fournisseurs = await Fournisseur.getAll();
            res.json(fournisseurs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const fournisseur = await Fournisseur.getById(req.params.id);
            if (!fournisseur) return res.status(404).json({ message: 'Fournisseur non trouvé' });
            res.json(fournisseur);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { nom } = req.body;
            if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
            const fournisseur = await Fournisseur.create(nom);
            res.status(201).json(fournisseur);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { nom } = req.body;
            if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
            const fournisseur = await Fournisseur.update(req.params.id, nom);
            if (!fournisseur) return res.status(404).json({ message: 'Fournisseur non trouvé' });
            res.json(fournisseur);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Fournisseur.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Fournisseur non trouvé' });
            res.json({ message: 'Fournisseur supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAchats(req, res) {
        try {
            const achats = await Fournisseur.getAchats(req.params.id);
            res.json(achats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = fournisseurController;

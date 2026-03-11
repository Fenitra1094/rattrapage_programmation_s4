const { VenteOeuf, VenteOeufDetail } = require('../models/VenteOeuf');

const venteOeufController = {
    async getAll(req, res) {
        try {
            const ventes = await VenteOeuf.getAll();
            res.json(ventes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const vente = await VenteOeuf.getById(req.params.id);
            if (!vente) return res.status(404).json({ message: 'Vente non trouvée' });
            const details = await VenteOeuf.getDetails(req.params.id);
            res.json({ ...vente, details });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Création simultanée mère + filles
    async create(req, res) {
        try {
            const { id_client, details } = req.body;
            if (!id_client || !details || !Array.isArray(details) || details.length === 0) {
                return res.status(400).json({ message: 'id_client et details (tableau non vide) sont requis' });
            }
            for (const d of details) {
                if (d.quantite == null || !d.id_lot) {
                    return res.status(400).json({ message: 'Chaque détail doit avoir quantite et id_lot' });
                }
            }
            const vente = await VenteOeuf.createWithDetails({ id_client, details });
            res.status(201).json(vente);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id_client } = req.body;
            if (!id_client) return res.status(400).json({ message: 'id_client est requis' });
            const vente = await VenteOeuf.update(req.params.id, { id_client });
            if (!vente) return res.status(404).json({ message: 'Vente non trouvée' });
            res.json(vente);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await VenteOeuf.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Vente non trouvée' });
            res.json({ message: 'Vente supprimée avec ses détails' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByClient(req, res) {
        try {
            const ventes = await VenteOeuf.getByClient(req.params.id_client);
            res.json(ventes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getChiffreAffaires(req, res) {
        try {
            const { dateDebut, dateFin } = req.query;
            if (!dateDebut || !dateFin) {
                return res.status(400).json({ message: 'dateDebut et dateFin sont requis (query params)' });
            }
            const result = await VenteOeuf.getChiffreAffaires(dateDebut, dateFin);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

// Controller pour les détails individuels
const venteOeufDetailController = {
    async getAll(req, res) {
        try {
            const details = await VenteOeufDetail.getAll();
            res.json(details);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const detail = await VenteOeufDetail.getById(req.params.id);
            if (!detail) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { quantite, prix_unitaire, id_vente_oeufs, id_lot } = req.body;
            if (quantite == null || prix_unitaire == null || !id_vente_oeufs || !id_lot) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_vente_oeufs et id_lot sont requis' });
            }
            const detail = await VenteOeufDetail.create({ quantite, prix_unitaire, id_vente_oeufs, id_lot });
            res.status(201).json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { quantite, prix_unitaire, id_vente_oeufs, id_lot } = req.body;
            if (quantite == null || prix_unitaire == null || !id_vente_oeufs || !id_lot) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_vente_oeufs et id_lot sont requis' });
            }
            const detail = await VenteOeufDetail.update(req.params.id, { quantite, prix_unitaire, id_vente_oeufs, id_lot });
            if (!detail) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await VenteOeufDetail.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json({ message: 'Détail supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = { venteOeufController, venteOeufDetailController };

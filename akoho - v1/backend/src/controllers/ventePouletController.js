const { VentePoulet, VentePouletDetail } = require('../models/VentePoulet');

const ventePouletController = {
    async getAll(req, res) {
        try {
            const ventes = await VentePoulet.getAll();
            res.json(ventes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const vente = await VentePoulet.getById(req.params.id);
            if (!vente) return res.status(404).json({ message: 'Vente non trouvée' });
            const details = await VentePoulet.getDetails(req.params.id);
            res.json({ ...vente, details });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Création simultanée mère + filles
    async create(req, res) {
        try {
            const { id_client, date_reg, details } = req.body;
            if (!id_client || !details || !Array.isArray(details) || details.length === 0) {
                return res.status(400).json({ message: 'id_client et details (tableau non vide) sont requis' });
            }
            for (const d of details) {
                if (d.quantite == null || !d.id_lot) {
                    return res.status(400).json({ message: 'Chaque détail doit avoir quantite et id_lot' });
                }
            }
            const vente = await VentePoulet.createWithDetails({ id_client, date_reg, details });
            res.status(201).json(vente);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id_client } = req.body;
            if (!id_client) return res.status(400).json({ message: 'id_client est requis' });
            const vente = await VentePoulet.update(req.params.id, { id_client });
            if (!vente) return res.status(404).json({ message: 'Vente non trouvée' });
            res.json(vente);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await VentePoulet.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Vente non trouvée' });
            res.json({ message: 'Vente supprimée avec ses détails' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByClient(req, res) {
        try {
            const ventes = await VentePoulet.getByClient(req.params.id_client);
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
            const result = await VentePoulet.getChiffreAffaires(dateDebut, dateFin);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

// Controller pour les détails individuels
const ventePouletDetailController = {
    async getAll(req, res) {
        try {
            const details = await VentePouletDetail.getAll();
            res.json(details);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const detail = await VentePouletDetail.getById(req.params.id);
            if (!detail) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { quantite, prix_unitaire, id_lot, id_vente_poulet } = req.body;
            if (quantite == null || prix_unitaire == null || !id_lot || !id_vente_poulet) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_lot et id_vente_poulet sont requis' });
            }
            const detail = await VentePouletDetail.create({ quantite, prix_unitaire, id_lot, id_vente_poulet });
            res.status(201).json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { quantite, prix_unitaire, id_lot, id_vente_poulet } = req.body;
            if (quantite == null || prix_unitaire == null || !id_lot || !id_vente_poulet) {
                return res.status(400).json({ message: 'quantite, prix_unitaire, id_lot et id_vente_poulet sont requis' });
            }
            const detail = await VentePouletDetail.update(req.params.id, { quantite, prix_unitaire, id_lot, id_vente_poulet });
            if (!detail) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json(detail);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await VentePouletDetail.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Détail non trouvé' });
            res.json({ message: 'Détail supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = { ventePouletController, ventePouletDetailController };

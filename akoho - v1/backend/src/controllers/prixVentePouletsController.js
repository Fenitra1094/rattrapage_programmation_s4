const PrixVentePoulets = require('../models/PrixVentePoulets');

const prixVentePouletsController = {
    async getAll(req, res) {
        try {
            const prix = await PrixVentePoulets.getAll();
            res.json(prix);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const prix = await PrixVentePoulets.getById(req.params.id);
            if (!prix) return res.status(404).json({ message: 'Prix non trouvé' });
            res.json(prix);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { prix, id_race } = req.body;
            if (prix == null || !id_race) return res.status(400).json({ message: 'prix et id_race sont requis' });
            const result = await PrixVentePoulets.create({ prix, id_race });
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { prix, id_race } = req.body;
            if (prix == null || !id_race) return res.status(400).json({ message: 'prix et id_race sont requis' });
            const result = await PrixVentePoulets.update(req.params.id, { prix, id_race });
            if (!result) return res.status(404).json({ message: 'Prix non trouvé' });
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await PrixVentePoulets.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Prix non trouvé' });
            res.json({ message: 'Prix supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getLatestByRace(req, res) {
        try {
            const prix = await PrixVentePoulets.getLatestByRace(req.params.id_race);
            if (!prix) return res.status(404).json({ message: 'Aucun prix trouvé pour cette race' });
            res.json(prix);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByRace(req, res) {
        try {
            const prix = await PrixVentePoulets.getByRace(req.params.id_race);
            res.json(prix);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = prixVentePouletsController;

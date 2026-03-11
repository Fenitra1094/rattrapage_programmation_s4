const Race = require('../models/Race');

const raceController = {
    async getAll(req, res) {
        try {
            const races = await Race.getAll();
            res.json(races);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const race = await Race.getById(req.params.id);
            if (!race) return res.status(404).json({ message: 'Race non trouvée' });
            res.json(race);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { libelle } = req.body;
            if (!libelle) return res.status(400).json({ message: 'Le libellé est requis' });
            const race = await Race.create(libelle);
            res.status(201).json(race);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { libelle } = req.body;
            if (!libelle) return res.status(400).json({ message: 'Le libellé est requis' });
            const race = await Race.update(req.params.id, libelle);
            if (!race) return res.status(404).json({ message: 'Race non trouvée' });
            res.json(race);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Race.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Race non trouvée' });
            res.json({ message: 'Race supprimée' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getWithDetails(req, res) {
        try {
            const race = await Race.getWithDetails(req.params.id);
            if (!race) return res.status(404).json({ message: 'Race non trouvée' });
            res.json(race);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllWithSummary(req, res) {
        try {
            const races = await Race.getAllWithSummary();
            res.json(races);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = raceController;

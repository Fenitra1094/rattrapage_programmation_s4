const ConfigurationRace = require('../models/ConfigurationRace');

const configurationRaceController = {
    async getAll(req, res) {
        try {
            const configs = await ConfigurationRace.getAll();
            res.json(configs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const config = await ConfigurationRace.getById(req.params.id);
            if (!config) return res.status(404).json({ message: 'Configuration non trouvée' });
            res.json(config);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { num_semaine, consommation_nourriture, augmentation_poids, id_race } = req.body;
            if (num_semaine == null || !id_race) return res.status(400).json({ message: 'num_semaine et id_race sont requis' });
            const config = await ConfigurationRace.create({ num_semaine, consommation_nourriture, augmentation_poids, id_race });
            res.status(201).json(config);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { num_semaine, consommation_nourriture, augmentation_poids, id_race } = req.body;
            if (num_semaine == null || !id_race) return res.status(400).json({ message: 'num_semaine et id_race sont requis' });
            const config = await ConfigurationRace.update(req.params.id, { num_semaine, consommation_nourriture, augmentation_poids, id_race });
            if (!config) return res.status(404).json({ message: 'Configuration non trouvée' });
            res.json(config);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await ConfigurationRace.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Configuration non trouvée' });
            res.json({ message: 'Configuration supprimée' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByRace(req, res) {
        try {
            const configs = await ConfigurationRace.getByRace(req.params.id_race);
            res.json(configs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async estimerPoids(req, res) {
        try {
            const { id_race, num_semaine } = req.params;
            const result = await ConfigurationRace.estimerPoids(id_race, num_semaine);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async estimerConsommation(req, res) {
        try {
            const { id_race, num_semaine } = req.params;
            const result = await ConfigurationRace.estimerConsommation(id_race, num_semaine);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = configurationRaceController;

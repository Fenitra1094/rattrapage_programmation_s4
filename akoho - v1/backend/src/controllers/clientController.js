const Client = require('../models/Client');

const clientController = {
    async getAll(req, res) {
        try {
            const clients = await Client.getAll();
            res.json(clients);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const client = await Client.getById(req.params.id);
            if (!client) return res.status(404).json({ message: 'Client non trouvé' });
            res.json(client);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { nom } = req.body;
            if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
            const client = await Client.create(nom);
            res.status(201).json(client);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { nom } = req.body;
            if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
            const client = await Client.update(req.params.id, nom);
            if (!client) return res.status(404).json({ message: 'Client non trouvé' });
            res.json(client);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Client.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Client non trouvé' });
            res.json({ message: 'Client supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getVentes(req, res) {
        try {
            const ventes = await Client.getVentes(req.params.id);
            res.json(ventes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = clientController;

const Lot = require('../models/Lot');

const lotController = {
    async getAll(req, res) {
        try {
            const lots = await Lot.getAll();
            res.json(lots);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getById(req, res) {
        try {
            const lot = await Lot.getById(req.params.id);
            if (!lot) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json(lot);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { date_arrivee, age, poids_initial, id_race, quantite, prix_unitaire, id_fournisseur } = req.body;
            
            // Validation des champs obligatoires
            if (!date_arrivee || age == null || poids_initial == null || !id_race) {
                return res.status(400).json({ message: 'date_arrivee, age, poids_initial et id_race sont requis' });
            }

            // Si quantité fournie, prix et fournisseur sont obligatoires
            if (quantite && (!prix_unitaire || !id_fournisseur)) {
                return res.status(400).json({ 
                    message: 'prix_unitaire et id_fournisseur sont requis lorsque quantite est fournie' 
                });
            }

            // Si un des champs d'achat est fourni, tous doivent l'être
            if ((prix_unitaire || id_fournisseur) && !quantite) {
                return res.status(400).json({ 
                    message: 'quantite est requise lorsque prix_unitaire ou id_fournisseur sont fournis' 
                });
            }

            const lot = await Lot.create({ 
                date_arrivee, 
                age, 
                poids_initial,
                id_race, 
                quantite, 
                prix_unitaire, 
                id_fournisseur 
            });
            
            res.status(201).json(lot);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { date_arrivee, age, poids_initial, id_race } = req.body;
            if (!date_arrivee || age == null || poids_initial == null || !id_race) {
                return res.status(400).json({ message: 'date_arrivee, age, poids_initial et id_race sont requis' });
            }
            const lot = await Lot.update(req.params.id, { date_arrivee, age, poids_initial, id_race });
            if (!lot) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json(lot);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await Lot.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json({ message: 'Lot supprimé' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getStock(req, res) {
        try {
            const stock = await Lot.getStock(req.params.id);
            res.json(stock);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getStockOeufs(req, res) {
        try {
            const stock = await Lot.getStockOeufs(req.params.id);
            res.json(stock);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAgeActuel(req, res) {
        try {
            const lot = await Lot.getAgeActuel(req.params.id);
            if (!lot) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json(lot);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getAllWithDetails(req, res) {
        try {
            const lots = await Lot.getAllWithDetails();
            res.json(lots);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async estimerPoids(req, res) {
        try {
            const result = await Lot.estimerPoids(req.params.id);
            if (!result) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getByRace(req, res) {
        try {
            const lots = await Lot.getByRace(req.params.id_race);
            res.json(lots);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getConsommationNourriture(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({ message: 'Le paramètre date est requis (format YYYY-MM-DD)' });
            }
            const result = await Lot.getConsommationNourriture(id, new Date(date));
            if (!result) return res.status(404).json({ message: 'Lot non trouvé' });
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async faireEclore(req, res) {
        try {
            const { quantite_oeufs, date_eclosion } = req.body;
            const id_lot_source = parseInt(req.params.id);

            // Validation
            if (!quantite_oeufs || quantite_oeufs <= 0) {
                return res.status(400).json({ 
                    message: 'quantite_oeufs est requis et doit être supérieur à 0' 
                });
            }

            // Vérifier que le lot existe
            const lotSource = await Lot.getById(id_lot_source);
            if (!lotSource) {
                return res.status(404).json({ message: 'Lot source non trouvé' });
            }

            // Vérifier qu'il y a assez d'œufs dans le lot
            const stock = await Lot.getStockOeufs(id_lot_source);
            if (stock.stock_oeufs < quantite_oeufs) {
                return res.status(400).json({ 
                    message: `Stock d'œufs insuffisant. Disponible: ${stock.stock_oeufs}, Demandé: ${quantite_oeufs}` 
                });
            }

            // Faire éclore
            const result = await Lot.faireEclore({
                id_lot_source,
                quantite_oeufs,
                date_eclosion: date_eclosion || null
            });

            res.status(201).json({
                message: 'Éclosion réussie',
                ...result
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = lotController;

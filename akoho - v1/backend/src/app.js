const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import des routes
const raceRoutes = require('./routes/raceRoutes');
const prixNourritureRoutes = require('./routes/prixNourritureRoutes');
const configurationRaceRoutes = require('./routes/configurationRaceRoutes');
const prixVenteOeufsRoutes = require('./routes/prixVenteOeufsRoutes');
const prixVentePouletsRoutes = require('./routes/prixVentePouletsRoutes');
const raisonMouvementRoutes = require('./routes/raisonMouvementRoutes');
const fournisseurRoutes = require('./routes/fournisseurRoutes');
const clientRoutes = require('./routes/clientRoutes');
const lotRoutes = require('./routes/lotRoutes');
const lotMouvementRoutes = require('./routes/lotMouvementRoutes');
const oeufMouvementRoutes = require('./routes/oeufMouvementRoutes');
const achatPouletRoutes = require('./routes/achatPouletRoutes');
const ventePouletRoutes = require('./routes/ventePouletRoutes');
const venteOeufRoutes = require('./routes/venteOeufRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/races', raceRoutes);
app.use('/api/prix-nourritures', prixNourritureRoutes);
app.use('/api/configuration-races', configurationRaceRoutes);
app.use('/api/prix-vente-oeufs', prixVenteOeufsRoutes);
app.use('/api/prix-vente-poulets', prixVentePouletsRoutes);
app.use('/api/raisons-mouvements', raisonMouvementRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/lots-mouvements', lotMouvementRoutes);
app.use('/api/oeufs-mouvements', oeufMouvementRoutes);
app.use('/api/achats-poulets', achatPouletRoutes);
app.use('/api/ventes-poulets', ventePouletRoutes);
app.use('/api/ventes-oeufs', venteOeufRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de base
app.get('/', (req, res) => {
    res.json({ message: 'API Akoho - Gestion d\'élevage de poulets' });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
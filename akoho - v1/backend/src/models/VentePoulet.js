const { getConnection, sql } = require('../config/database');

class VentePoulet {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT vp.*, c.nom as client_nom,
                    (SELECT SUM(vpd.quantite * vpd.prix_unitaire) FROM vente_poulets_details vpd WHERE vpd.id_vente_poulet = vp.id) as montant_total,
                    (SELECT SUM(vpd.quantite) FROM vente_poulets_details vpd WHERE vpd.id_vente_poulet = vp.id) as quantite_totale
                FROM vente_poulets vp
                JOIN clients c ON vp.id_client = c.id
                ORDER BY vp.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vp.*, c.nom as client_nom
                FROM vente_poulets vp
                JOIN clients c ON vp.id_client = c.id
                WHERE vp.id = @id
            `);
        return result.recordset[0];
    }

    static async getDetails(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vpd.*, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM vente_poulets_details vpd
                JOIN lots l ON vpd.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE vpd.id_vente_poulet = @id
            `);
        return result.recordset;
    }

    // Création simultanée vente + détails dans une transaction
    // prix_unitaire calculé automatiquement : poids_actuel * prix_gramme_poulet
    static async createWithDetails({ id_client, date_reg , details }) {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const dateVente = date_reg;

            // VÉRIFICATION 1 : Valider que les quantités sont positives
            for (const d of details) {
                if (!d.quantite || d.quantite <= 0) {
                    throw new Error(`La quantité doit être strictement positive (lot ${d.id_lot})`);
                }
            }

            // VÉRIFICATION 2 : Vérifier le stock disponible pour chaque lot
            for (const d of details) {
                const stockResult = await new sql.Request(transaction)
                    .input('id_lot', sql.Int, d.id_lot)
                    .query(`
                        SELECT ISNULL(SUM(lm.quantite), 0) as stock_poulets
                        FROM lots_mouvements lm
                        WHERE lm.id_lot = @id_lot
                    `);
                
                const stockActuel = stockResult.recordset[0].stock_poulets;
                
                if (stockActuel < d.quantite) {
                    // Récupérer les infos du lot pour un message d'erreur plus clair
                    const lotInfo = await new sql.Request(transaction)
                        .input('id_lot', sql.Int, d.id_lot)
                        .query('SELECT l.*, r.libelle as race_libelle FROM lots l JOIN races r ON l.id_race = r.id WHERE l.id = @id_lot');
                    const lot = lotInfo.recordset[0];
                    
                    throw new Error(`Stock insuffisant pour le lot #${d.id_lot} (${lot.race_libelle}). `+
                                  `Disponible: ${stockActuel}, Demandé: ${d.quantite}`);
                }
            }

            // Créer la vente mère
            const venteResult = await new sql.Request(transaction)
                .input('date_reg', sql.DateTime2, dateVente)
                .input('id_client', sql.Int, id_client)
                .query('INSERT INTO vente_poulets (date_reg, id_client) OUTPUT INSERTED.* VALUES (@date_reg, @id_client)');

            const vente = venteResult.recordset[0];

            // Récupérer ou créer la raison "Vente poulets"
            const raisonResult = await new sql.Request(transaction)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM raisons_mouvements WHERE libelle = 'Vente poulets')
                        INSERT INTO raisons_mouvements (libelle) VALUES ('Vente poulets')
                    SELECT id FROM raisons_mouvements WHERE libelle = 'Vente poulets'
                `);
            const id_raison_vente = raisonResult.recordset[0].id;

            // Créer les détails (lignes filles)
            const detailsInserted = [];
            for (let i = 0; i < details.length; i++) {
                const d = details[i];

                // Récupérer le lot pour calculer le poids actuel
                const lotResult = await new sql.Request(transaction)
                    .input('id_lot', sql.Int, d.id_lot)
                    .query('SELECT * FROM lots WHERE id = @id_lot');
                const lot = lotResult.recordset[0];
                if (!lot) throw new Error(`Lot ${d.id_lot} non trouvé`);

                // Semaine de croissance à la date de vente
                const joursDepuisArrivee = Math.floor((new Date(dateVente) - new Date(lot.date_arrivee)) / (24 * 60 * 60 * 1000));
                
                console.log("jours depuis arrivee:",joursDepuisArrivee);
                console.log("date de vente:",dateVente);
                console.log("date d'arrivee du lot:",lot.date_arrivee);
                const semaineCroissance = lot.age + Math.floor(joursDepuisArrivee / 7);

                // Gain de poids depuis la semaine d'arrivée jusqu'à la semaine actuelle
                const poidsResult = await new sql.Request(transaction)
                    .input('id_race', sql.Int, lot.id_race)
                    .input('age_initial', sql.Int, lot.age)
                    .input('semaine_actuelle', sql.Int, semaineCroissance)
                    .query(`
                        SELECT ISNULL(SUM(augmentation_poids), 0) as gain_poids
                        FROM configuration_races
                        WHERE id_race = @id_race
                          AND num_semaine > @age_initial
                          AND num_semaine <= @semaine_actuelle
                    `);
                    console.log("Age initial:",lot.age);
                    console.log("Age actuel:",semaineCroissance);
                    const poids_actuel = parseFloat(lot.poids_initial) + parseFloat(poidsResult.recordset[0].gain_poids);
                    console.log("Gain de poids:",poidsResult);
                    console.log("Poids initial:"+poids_actuel);

                // Prix du gramme de poulet le plus récent pour cette race à la date de vente
                const prixResult = await new sql.Request(transaction)
                    .input('id_race', sql.Int, lot.id_race)
                    .input('date_vente', sql.DateTime2, dateVente)
                    .query(`
                        SELECT TOP 1 prix
                        FROM prix_vente_poulets
                        WHERE id_race = @id_race AND date_reg <= @date_vente
                        ORDER BY date_reg DESC
                    `);
                const prix_gramme = parseFloat(prixResult.recordset[0]?.prix || 0);

                // prix_unitaire = poids actuel (unité configurée) × prix par gramme
                const prix_unitaire = poids_actuel * prix_gramme;

                const detailResult = await new sql.Request(transaction)
                    .input('quantite', sql.Int, d.quantite)
                    .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
                    .input('id_lot', sql.Int, d.id_lot)
                    .input('id_vente_poulet', sql.Int, vente.id)
                    .query(`INSERT INTO vente_poulets_details (quantite, prix_unitaire, id_lot, id_vente_poulet)
                            OUTPUT INSERTED.*
                            VALUES (@quantite, @prix_unitaire, @id_lot, @id_vente_poulet)`);
                detailsInserted.push(detailResult.recordset[0]);

                // Mouvement de stock négatif dans lots_mouvements
                await new sql.Request(transaction)
                    .input('date_reg', sql.DateTime2, dateVente)
                    .input('quantite', sql.Int, -d.quantite)
                    .input('reference', sql.VarChar(255), `Vente #${vente.id}`)
                    .input('remarque', sql.VarChar(sql.MAX), `Vente de ${d.quantite} poulet(s)`)
                    .input('id_lot', sql.Int, d.id_lot)
                    .input('id_raison_mouvement', sql.Int, id_raison_vente)
                    .query(`INSERT INTO lots_mouvements (date_reg, quantite, reference, remarque, id_lot, id_raison_mouvement)
                            VALUES (@date_reg, @quantite, @reference, @remarque, @id_lot, @id_raison_mouvement)`);
            }

            await transaction.commit();
            return { ...vente, details: detailsInserted };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    static async update(id, { id_client }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('id_client', sql.Int, id_client)
            .query('UPDATE vente_poulets SET id_client = @id_client OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    // Suppression en cascade (détails + vente) dans une transaction
    static async delete(id) {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM vente_poulets_details WHERE id_vente_poulet = @id');

            const result = await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM vente_poulets WHERE id = @id');

            await transaction.commit();
            return result.rowsAffected[0];
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    // Ventes par client
    static async getByClient(id_client) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_client', sql.Int, id_client)
            .query(`
                SELECT vp.*, c.nom as client_nom,
                    (SELECT SUM(vpd.quantite * vpd.prix_unitaire) FROM vente_poulets_details vpd WHERE vpd.id_vente_poulet = vp.id) as montant_total,
                    (SELECT SUM(vpd.quantite) FROM vente_poulets_details vpd WHERE vpd.id_vente_poulet = vp.id) as quantite_totale
                FROM vente_poulets vp
                JOIN clients c ON vp.id_client = c.id
                WHERE vp.id_client = @id_client
                ORDER BY vp.date_reg DESC
            `);
        return result.recordset;
    }

    // Chiffre d'affaires poulets sur une période
    static async getChiffreAffaires(dateDebut, dateFin) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('dateDebut', sql.DateTime2, dateDebut)
            .input('dateFin', sql.DateTime2, dateFin)
            .query(`
                SELECT ISNULL(SUM(vpd.quantite * vpd.prix_unitaire), 0) as chiffre_affaires,
                       ISNULL(SUM(vpd.quantite), 0) as quantite_totale
                FROM vente_poulets_details vpd
                JOIN vente_poulets vp ON vpd.id_vente_poulet = vp.id
                WHERE vp.date_reg BETWEEN @dateDebut AND @dateFin
            `);
        return result.recordset[0];
    }
}

// CRUD séparé pour les détails de vente poulets
class VentePouletDetail {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT vpd.*, l.date_arrivee, r.libelle as race_libelle
                FROM vente_poulets_details vpd
                JOIN lots l ON vpd.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                ORDER BY vpd.id
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vpd.*, l.date_arrivee, r.libelle as race_libelle
                FROM vente_poulets_details vpd
                JOIN lots l ON vpd.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE vpd.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ quantite, prix_unitaire, id_lot, id_vente_poulet }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('id_lot', sql.Int, id_lot)
            .input('id_vente_poulet', sql.Int, id_vente_poulet)
            .query(`INSERT INTO vente_poulets_details (quantite, prix_unitaire, id_lot, id_vente_poulet)
                    OUTPUT INSERTED.*
                    VALUES (@quantite, @prix_unitaire, @id_lot, @id_vente_poulet)`);
        return result.recordset[0];
    }

    static async update(id, { quantite, prix_unitaire, id_lot, id_vente_poulet }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('id_lot', sql.Int, id_lot)
            .input('id_vente_poulet', sql.Int, id_vente_poulet)
            .query(`UPDATE vente_poulets_details
                    SET quantite = @quantite, prix_unitaire = @prix_unitaire,
                        id_lot = @id_lot, id_vente_poulet = @id_vente_poulet
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM vente_poulets_details WHERE id = @id');
        return result.rowsAffected[0];
    }
}

module.exports = { VentePoulet, VentePouletDetail };

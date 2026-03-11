const { getConnection, sql } = require('../config/database');

class VenteOeuf {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT vo.*, c.nom as client_nom,
                    (SELECT SUM(vod.quantite * vod.prix_unitaire) FROM vente_oeufs_details vod WHERE vod.id_vente_oeufs = vo.id) as montant_total,
                    (SELECT SUM(vod.quantite) FROM vente_oeufs_details vod WHERE vod.id_vente_oeufs = vo.id) as quantite_totale
                FROM vente_oeufs vo
                JOIN clients c ON vo.id_client = c.id
                ORDER BY vo.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vo.*, c.nom as client_nom
                FROM vente_oeufs vo
                JOIN clients c ON vo.id_client = c.id
                WHERE vo.id = @id
            `);
        return result.recordset[0];
    }

    static async getDetails(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vod.*, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM vente_oeufs_details vod
                JOIN lots l ON vod.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE vod.id_vente_oeufs = @id
            `);
        return result.recordset;
    }

    // Création simultanée vente + détails dans une transaction
    // prix_unitaire déterminé automatiquement depuis prix_vente_oeufs pour la race du lot
    static async createWithDetails({ id_client, details }) {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            const dateVente = new Date();

            // VÉRIFICATION 1 : Valider que les quantités sont positives
            for (const d of details) {
                if (!d.quantite || d.quantite <= 0) {
                    throw new Error(`La quantité doit être strictement positive (lot ${d.id_lot})`);
                }
            }

            // VÉRIFICATION 2 : Vérifier le stock d'œufs disponible pour chaque lot
            for (const d of details) {
                const stockResult = await new sql.Request(transaction)
                    .input('id_lot', sql.Int, d.id_lot)
                    .query(`
                        SELECT ISNULL(SUM(om.quantite), 0) as stock_oeufs
                        FROM oeufs_mouvements om
                        WHERE om.id_lot = @id_lot
                    `);
                
                const stockActuel = stockResult.recordset[0].stock_oeufs;
                
                if (stockActuel < d.quantite) {
                    // Récupérer les infos du lot pour un message d'erreur plus clair
                    const lotInfo = await new sql.Request(transaction)
                        .input('id_lot', sql.Int, d.id_lot)
                        .query('SELECT l.*, r.libelle as race_libelle FROM lots l JOIN races r ON l.id_race = r.id WHERE l.id = @id_lot');
                    const lot = lotInfo.recordset[0];
                    
                    throw new Error(`Stock d'œufs insuffisant pour le lot #${d.id_lot} (${lot.race_libelle}). `+
                                  `Disponible: ${stockActuel}, Demandé: ${d.quantite}`);
                }
            }

            // Créer la vente mère
            const venteResult = await new sql.Request(transaction)
                .input('date_reg', sql.DateTime2, dateVente)
                .input('id_client', sql.Int, id_client)
                .query('INSERT INTO vente_oeufs (date_reg, id_client) OUTPUT INSERTED.* VALUES (@date_reg, @id_client)');

            const vente = venteResult.recordset[0];

            // Récupérer ou créer la raison "Vente oeufs"
            const raisonResult = await new sql.Request(transaction)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM raisons_mouvements WHERE libelle = 'Vente oeufs')
                        INSERT INTO raisons_mouvements (libelle) VALUES ('Vente oeufs')
                    SELECT id FROM raisons_mouvements WHERE libelle = 'Vente oeufs'
                `);
            const id_raison_vente = raisonResult.recordset[0].id;

            // Créer les détails (lignes filles)
            const detailsInserted = [];
            for (let i = 0; i < details.length; i++) {
                const d = details[i];

                // Récupérer la race du lot
                const lotResult = await new sql.Request(transaction)
                    .input('id_lot', sql.Int, d.id_lot)
                    .query('SELECT id_race FROM lots WHERE id = @id_lot');
                const lot = lotResult.recordset[0];
                if (!lot) throw new Error(`Lot ${d.id_lot} non trouvé`);

                // Prix de vente oeufs le plus récent pour cette race à la date de vente
                const prixResult = await new sql.Request(transaction)
                    .input('id_race', sql.Int, lot.id_race)
                    .input('date_vente', sql.DateTime2, dateVente)
                    .query(`
                        SELECT TOP 1 prix
                        FROM prix_vente_oeufs
                        WHERE id_race = @id_race AND date_reg <= @date_vente
                        ORDER BY date_reg DESC
                    `);
                const prix_unitaire = parseFloat(prixResult.recordset[0]?.prix || 0);

                const detailResult = await new sql.Request(transaction)
                    .input('quantite', sql.Int, d.quantite)
                    .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
                    .input('id_vente_oeufs', sql.Int, vente.id)
                    .input('id_lot', sql.Int, d.id_lot)
                    .query(`INSERT INTO vente_oeufs_details (quantite, prix_unitaire, id_vente_oeufs, id_lot)
                            OUTPUT INSERTED.*
                            VALUES (@quantite, @prix_unitaire, @id_vente_oeufs, @id_lot)`);
                detailsInserted.push(detailResult.recordset[0]);

                // Mouvement de stock négatif dans oeufs_mouvements
                await new sql.Request(transaction)
                    .input('date_reg', sql.DateTime2, dateVente)
                    .input('quantite', sql.Int, -d.quantite)
                    .input('reference', sql.VarChar(255), `Vente #${vente.id}`)
                    .input('remarque', sql.VarChar(sql.MAX), `Vente de ${d.quantite} oeuf(s)`)
                    .input('id_lot', sql.Int, d.id_lot)
                    .input('id_raison_mouvement', sql.Int, id_raison_vente)
                    .query(`INSERT INTO oeufs_mouvements (date_reg, quantite, reference, remarque, id_lot, id_raison_mouvement)
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
            .query('UPDATE vente_oeufs SET id_client = @id_client OUTPUT INSERTED.* WHERE id = @id');
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
                .query('DELETE FROM vente_oeufs_details WHERE id_vente_oeufs = @id');

            const result = await new sql.Request(transaction)
                .input('id', sql.Int, id)
                .query('DELETE FROM vente_oeufs WHERE id = @id');

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
                SELECT vo.*, c.nom as client_nom,
                    (SELECT SUM(vod.quantite * vod.prix_unitaire) FROM vente_oeufs_details vod WHERE vod.id_vente_oeufs = vo.id) as montant_total,
                    (SELECT SUM(vod.quantite) FROM vente_oeufs_details vod WHERE vod.id_vente_oeufs = vo.id) as quantite_totale
                FROM vente_oeufs vo
                JOIN clients c ON vo.id_client = c.id
                WHERE vo.id_client = @id_client
                ORDER BY vo.date_reg DESC
            `);
        return result.recordset;
    }

    // Chiffre d'affaires oeufs sur une période
    static async getChiffreAffaires(dateDebut, dateFin) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('dateDebut', sql.DateTime2, dateDebut)
            .input('dateFin', sql.DateTime2, dateFin)
            .query(`
                SELECT ISNULL(SUM(vod.quantite * vod.prix_unitaire), 0) as chiffre_affaires,
                       ISNULL(SUM(vod.quantite), 0) as quantite_totale
                FROM vente_oeufs_details vod
                JOIN vente_oeufs vo ON vod.id_vente_oeufs = vo.id
                WHERE vo.date_reg BETWEEN @dateDebut AND @dateFin
            `);
        return result.recordset[0];
    }
}

// CRUD séparé pour les détails de vente oeufs
class VenteOeufDetail {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT vod.*, l.date_arrivee, r.libelle as race_libelle
                FROM vente_oeufs_details vod
                JOIN lots l ON vod.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                ORDER BY vod.id
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT vod.*, l.date_arrivee, r.libelle as race_libelle
                FROM vente_oeufs_details vod
                JOIN lots l ON vod.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE vod.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ quantite, prix_unitaire, id_vente_oeufs, id_lot }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('id_vente_oeufs', sql.Int, id_vente_oeufs)
            .input('id_lot', sql.Int, id_lot)
            .query(`INSERT INTO vente_oeufs_details (quantite, prix_unitaire, id_vente_oeufs, id_lot)
                    OUTPUT INSERTED.*
                    VALUES (@quantite, @prix_unitaire, @id_vente_oeufs, @id_lot)`);
        return result.recordset[0];
    }

    static async update(id, { quantite, prix_unitaire, id_vente_oeufs, id_lot }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('id_vente_oeufs', sql.Int, id_vente_oeufs)
            .input('id_lot', sql.Int, id_lot)
            .query(`UPDATE vente_oeufs_details
                    SET quantite = @quantite, prix_unitaire = @prix_unitaire,
                        id_vente_oeufs = @id_vente_oeufs, id_lot = @id_lot
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM vente_oeufs_details WHERE id = @id');
        return result.rowsAffected[0];
    }
}

module.exports = { VenteOeuf, VenteOeufDetail };

const { getConnection, sql } = require('../config/database');

class Lot {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT l.*, r.libelle as race_libelle
                FROM lots l
                JOIN races r ON l.id_race = r.id
                ORDER BY l.date_arrivee DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT l.*, r.libelle as race_libelle
                FROM lots l
                JOIN races r ON l.id_race = r.id
                WHERE l.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ date_arrivee, age, poids_initial, id_race, quantite, prix_unitaire, id_fournisseur }) {
        console.log("poids initial",poids_initial);
        
        // VÉRIFICATIONS : Valider les paramètres
        if (age < 0) {
            throw new Error('L\'âge du lot ne peut pas être négatif');
        }
        if (poids_initial < 0) {
            throw new Error('Le poids initial ne peut pas être négatif');
        }
        if (quantite && quantite <= 0) {
            throw new Error('La quantité doit être strictement positive');
        }
        if (prix_unitaire && prix_unitaire < 0) {
            throw new Error('Le prix unitaire ne peut pas être négatif');
        }
        
        const pool = await getConnection();
        const transaction = pool.transaction();
        
        try {
            await transaction.begin();

            // 1. Créer le lot
            const lotResult = await transaction.request()
                .input('date_arrivee', sql.Date, date_arrivee)
                .input('age', sql.Int, age)
                .input('poids_initial', sql.Decimal(15,2), poids_initial)
                .input('id_race', sql.Int, id_race)
                .query('INSERT INTO lots (date_arrivee, age, poids_initial, id_race) OUTPUT INSERTED.* VALUES (@date_arrivee, @age, @poids_initial, @id_race)');
            
            const lot = lotResult.recordset[0];

            // Si quantité et prix fournis, créer l'achat et le mouvement
            if (quantite && prix_unitaire && id_fournisseur) {
                // 2. Créer l'achat de poulets
                await transaction.request()
                    .input('quantite', sql.Int, quantite)
                    .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
                    .input('date_reg', sql.DateTime2, new Date())
                    .input('id_fournisseur', sql.Int, id_fournisseur)
                    .input('id_lot', sql.Int, lot.id)
                    .query(`INSERT INTO achat_poulets (quantite, prix_unitaire, date_reg, id_fournisseur, id_lot)
                            VALUES (@quantite, @prix_unitaire, @date_reg, @id_fournisseur, @id_lot)`);

                // 3. Récupérer ou créer la raison "Achat initial"
                const raisonResult = await transaction.request()
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM raisons_mouvements WHERE libelle = 'Achat initial')
                        BEGIN
                            INSERT INTO raisons_mouvements (libelle) VALUES ('Achat initial')
                        END
                        SELECT id FROM raisons_mouvements WHERE libelle = 'Achat initial'
                    `);
                
                const id_raison = raisonResult.recordset[0].id;

                // 4. Créer le mouvement d'entrée (quantité positive)
                await transaction.request()
                    .input('date_reg', sql.DateTime2, new Date())
                    .input('quantite', sql.Int, quantite)
                    .input('reference', sql.VarChar(255), `Achat initial - Lot ${lot.id}`)
                    .input('remarque', sql.VarChar(sql.MAX), `Entrée de ${quantite} poulets`)
                    .input('id_lot', sql.Int, lot.id)
                    .input('id_raison_mouvement', sql.Int, id_raison)
                    .query(`INSERT INTO lots_mouvements (date_reg, quantite, reference, remarque, id_lot, id_raison_mouvement)
                            VALUES (@date_reg, @quantite, @reference, @remarque, @id_lot, @id_raison_mouvement)`);
            }

            await transaction.commit();
            return lot;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async update(id, { date_arrivee, age, poids_initial, id_race }) {
        // VÉRIFICATIONS : Valider les paramètres
        if (age < 0) {
            throw new Error('L\'âge du lot ne peut pas être négatif');
        }
        if (poids_initial < 0) {
            throw new Error('Le poids initial ne peut pas être négatif');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('date_arrivee', sql.Date, date_arrivee)
            .input('age', sql.Int, age)
            .input('poids_initial', sql.Decimal(15,2), poids_initial)
            .input('id_race', sql.Int, id_race)
            .query('UPDATE lots SET date_arrivee = @date_arrivee, age = @age, poids_initial = @poids_initial, id_race = @id_race OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM lots WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Stock actuel de poulets dans un lot (somme des mouvements)
    static async getStock(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT ISNULL(SUM(lm.quantite), 0) as stock_poulets
                FROM lots_mouvements lm
                WHERE lm.id_lot = @id
            `);
        return result.recordset[0];
    }

    // Stock actuel d'oeufs dans un lot (somme des mouvements oeufs)
    static async getStockOeufs(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT ISNULL(SUM(om.quantite), 0) as stock_oeufs
                FROM oeufs_mouvements om
                WHERE om.id_lot = @id
            `);
        return result.recordset[0];
    }

    // Age actuel en semaines (basé sur date d'arrivée et age initial)
    static async getAgeActuel(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT l.*,
                    l.age + DATEDIFF(WEEK, l.date_arrivee, GETDATE()) as age_actuel_semaines
                FROM lots l
                WHERE l.id = @id
            `);
        return result.recordset[0];
    }

    // Récupérer tous les lots avec stocks et âge actuel
    static async getAllWithDetails() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT l.*, r.libelle as race_libelle,
                    l.age + DATEDIFF(WEEK, l.date_arrivee, GETDATE()) as age_actuel_semaines,
                    ISNULL((SELECT SUM(lm.quantite) FROM lots_mouvements lm WHERE lm.id_lot = l.id), 0) as stock_poulets,
                    ISNULL((SELECT SUM(om.quantite) FROM oeufs_mouvements om WHERE om.id_lot = l.id), 0) as stock_oeufs
                FROM lots l
                JOIN races r ON l.id_race = r.id
                ORDER BY l.date_arrivee DESC
            `);
        return result.recordset;
    }

    // Estimer le poids actuel des poulets d'un lot
    static async estimerPoids(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT l.id, l.age + DATEDIFF(WEEK, l.date_arrivee, GETDATE()) as age_actuel_semaines,
                    ISNULL((
                        SELECT SUM(cr.augmentation_poids)
                        FROM configuration_races cr
                        WHERE cr.id_race = l.id_race
                        AND cr.num_semaine <= (l.age + DATEDIFF(WEEK, l.date_arrivee, GETDATE()))
                    ), 0) as poids_estime
                FROM lots l
                WHERE l.id = @id
            `);
        return result.recordset[0];
    }

    // Lots par race
    static async getByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT l.*, r.libelle as race_libelle,
                    l.age + DATEDIFF(WEEK, l.date_arrivee, GETDATE()) as age_actuel_semaines,
                    ISNULL((SELECT SUM(lm.quantite) FROM lots_mouvements lm WHERE lm.id_lot = l.id), 0) as stock_poulets
                FROM lots l
                JOIN races r ON l.id_race = r.id
                WHERE l.id_race = @id_race
                ORDER BY l.date_arrivee DESC
            `);
        return result.recordset;
    }

    // Calcul consommation nourriture pour un lot à une date donnée
    // Retourne 0 si la date tombe un weekend (samedi=6, dimanche=0)
    // Retourne 0 si pas de configuration pour la semaine/race
    static async getConsommationNourriture(id, date) {
        const pool = await getConnection();

        // 0. Vérifier si c'est un weekend → 0 consommation
        const day = date.getDay(); // 0=dimanche, 6=samedi
        if (day === 0 || day === 6) {
            return {
                id_lot: id,
                date,
                nb_poulets: 0,
                num_semaine: 0,
                consommation_semaine: 0,
                consommation_jour: 0,
                prix_nourriture: 0,
                cout_total: 0
            };
        }

        // 1. Récupérer le lot
        const lotResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM lots WHERE id = @id');
        const lot = lotResult.recordset[0];
        if (!lot) return null;

        // 2. Nombre de poulets à la date donnée
        const stockResult = await pool.request()
            .input('id_lot', sql.Int, id)
            .input('date', sql.DateTime2, date)
            .query(`
                SELECT ISNULL(SUM(lm.quantite), 0) as nb_poulets
                FROM lots_mouvements lm
                WHERE lm.id_lot = @id_lot AND lm.date_reg <= @date
            `);
        const nb_poulets = stockResult.recordset[0].nb_poulets;

        // 3. Numéro de semaine = age initial + semaines écoulées depuis l'arrivée
        const ageSemainesResult = await pool.request()
            .input('id', sql.Int, id)
            .input('date', sql.DateTime2, date)
            .query(`
                SELECT l.age + DATEDIFF(DAY, l.date_arrivee, @date) / 7 as num_semaine
                FROM lots l
                WHERE l.id = @id
            `);
        const num_semaine = ageSemainesResult.recordset[0].num_semaine;

        // 4. Consommation hebdomadaire depuis configuration_races (0 si pas trouvé)
        const configResult = await pool.request()
            .input('num_semaine', sql.Int, num_semaine)
            .input('id_race', sql.Int, lot.id_race)
            .query(`
                SELECT consommation_nourriture
                FROM configuration_races
                WHERE num_semaine = @num_semaine AND id_race = @id_race
            `);
        const consommation_semaine = configResult.recordset[0]?.consommation_nourriture || 0;
        const consommation_jour = consommation_semaine / 7;

        // 5. Prix nourriture le plus récent pour cette race à cette date
        const prixResult = await pool.request()
            .input('id_race', sql.Int, lot.id_race)
            .input('date', sql.DateTime2, date)
            .query(`
                SELECT TOP 1 prix
                FROM prix_nourritures
                WHERE id_race = @id_race AND date_reg <= @date
                ORDER BY date_reg DESC
            `);
        const prix_nourriture = prixResult.recordset[0]?.prix || 0;

        const cout_total = nb_poulets * consommation_jour * prix_nourriture;

        return {
            id_lot: id,
            date,
            nb_poulets,
            num_semaine,
            consommation_semaine: parseFloat(consommation_semaine),
            consommation_jour: parseFloat(consommation_jour.toFixed(4)),
            prix_nourriture: parseFloat(prix_nourriture),
            cout_total: parseFloat(cout_total.toFixed(2))
        };
    }

    // Faire éclore des œufs pour créer un nouveau lot
    static async faireEclore({ id_lot_source, quantite_oeufs, date_eclosion }) {
        const pool = await getConnection();
        const transaction = pool.transaction();

        try {
            await transaction.begin();

            // 1. Récupérer le lot source pour obtenir la race
            const lotSourceResult = await transaction.request()
                .input('id_lot', sql.Int, id_lot_source)
                .query('SELECT * FROM lots WHERE id = @id_lot');
            
            const lotSource = lotSourceResult.recordset[0];
            if (!lotSource) {
                throw new Error('Lot source non trouvé');
            }

            // 2. Récupérer la valeur de TMP-INCUB depuis la table configurations
            const configResult = await transaction.request()
                .query("SELECT valeur FROM configurations WHERE code = 'TMP-INCUB'");
            
            const tmpIncub = configResult.recordset[0]?.valeur || 45;

            // 3. Calculer la date d'arrivée (date_eclosion + TMP-INCUB jours)
            const dateEclosionObj = date_eclosion ? new Date(date_eclosion) : new Date();
            const dateArrivee = new Date(dateEclosionObj);
            dateArrivee.setDate(dateArrivee.getDate() + parseInt(tmpIncub));

            // 4. Créer le nouveau lot (âge = 0 semaines)
            const nouveauLotResult = await transaction.request()
                .input('date_arrivee', sql.Date, dateArrivee)
                .input('age', sql.Int, 0)
                .input('poids_initial', sql.Decimal(15,2), 0)
                .input('id_race', sql.Int, lotSource.id_race)
                .query('INSERT INTO lots (date_arrivee, age, poids_initial, id_race) OUTPUT INSERTED.* VALUES (@date_arrivee, @age, @poids_initial, @id_race)');
            
            const nouveauLot = nouveauLotResult.recordset[0];

            // 5. Récupérer l'ID de la raison "Eclosion oeufs"
            const raisonResult = await transaction.request()
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM raisons_mouvements WHERE libelle = 'Eclosion oeufs')
                    BEGIN
                        INSERT INTO raisons_mouvements (libelle) VALUES ('Eclosion oeufs')
                    END
                    SELECT id FROM raisons_mouvements WHERE libelle = 'Eclosion oeufs'
                `);
            
            const id_raison = raisonResult.recordset[0].id;

            // 6. Créer un mouvement négatif d'œufs dans le lot source (retrait)
            await transaction.request()
                .input('date_reg', sql.DateTime2, dateEclosionObj)
                .input('quantite', sql.Int, -quantite_oeufs) // Négatif pour retrait
                .input('reference', sql.VarChar(255), `Eclosion vers lot ${nouveauLot.id}`)
                .input('remarque', sql.VarChar(sql.MAX), `Éclosion de ${quantite_oeufs} œufs`)
                .input('id_lot', sql.Int, id_lot_source)
                .input('id_raison_mouvement', sql.Int, id_raison)
                .query(`INSERT INTO oeufs_mouvements (date_reg, quantite, reference, remarque, id_lot, id_raison_mouvement)
                        VALUES (@date_reg, @quantite, @reference, @remarque, @id_lot, @id_raison_mouvement)`);

            // 7. Créer un mouvement positif de poulets dans le nouveau lot (ajout)
            await transaction.request()
                .input('date_reg', sql.DateTime2, dateEclosionObj)
                .input('quantite', sql.Int, quantite_oeufs) // Positif pour ajout
                .input('reference', sql.VarChar(255), `Eclosion depuis lot ${id_lot_source}`)
                .input('remarque', sql.VarChar(sql.MAX), `Naissance de ${quantite_oeufs} poulets issus d'éclosion`)
                .input('id_lot', sql.Int, nouveauLot.id)
                .input('id_raison_mouvement', sql.Int, id_raison)
                .query(`INSERT INTO lots_mouvements (date_reg, quantite, reference, remarque, id_lot, id_raison_mouvement)
                        VALUES (@date_reg, @quantite, @reference, @remarque, @id_lot, @id_raison_mouvement)`);

            await transaction.commit();
            
            return {
                nouveau_lot: nouveauLot,
                lot_source: lotSource,
                quantite_eclore: quantite_oeufs,
                date_eclosion: dateEclosionObj,
                date_arrivee_poulets: dateArrivee
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = Lot;

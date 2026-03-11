const { getConnection, sql } = require('../config/database');

class OeufMouvement {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT om.*, l.date_arrivee, r.libelle as race_libelle, rm.libelle as raison_libelle
                FROM oeufs_mouvements om
                JOIN lots l ON om.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                JOIN raisons_mouvements rm ON om.id_raison_mouvement = rm.id
                ORDER BY om.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT om.*, l.date_arrivee, r.libelle as race_libelle, rm.libelle as raison_libelle
                FROM oeufs_mouvements om
                JOIN lots l ON om.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                JOIN raisons_mouvements rm ON om.id_raison_mouvement = rm.id
                WHERE om.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ quantite, reference, remarque, id_raison_mouvement, id_lot }) {
        const pool = await getConnection();
        
        // VÉRIFICATION : Si mouvement négatif, vérifier que le stock d'œufs ne passe pas en dessous de zéro
        if (quantite < 0) {
            const stockResult = await pool.request()
                .input('id_lot', sql.Int, id_lot)
                .query(`
                    SELECT ISNULL(SUM(om.quantite), 0) as stock_oeufs
                    FROM oeufs_mouvements om
                    WHERE om.id_lot = @id_lot
                `);
            
            const stockActuel = stockResult.recordset[0].stock_oeufs;
            
            if (stockActuel + quantite < 0) {
                throw new Error(`Stock d'œufs insuffisant pour ce mouvement. `+
                              `Stock actuel: ${stockActuel}, Mouvement: ${quantite}, `+
                              `Stock résultant: ${stockActuel + quantite}`);
            }
        }
        
        const result = await pool.request()
            .input('date_reg', sql.DateTime2, new Date())
            .input('quantite', sql.Int, quantite)
            .input('reference', sql.VarChar(255), reference || null)
            .input('remarque', sql.VarChar(sql.MAX), remarque || null)
            .input('id_raison_mouvement', sql.Int, id_raison_mouvement)
            .input('id_lot', sql.Int, id_lot)
            .query(`INSERT INTO oeufs_mouvements (date_reg, quantite, reference, remarque, id_raison_mouvement, id_lot)
                    OUTPUT INSERTED.*
                    VALUES (@date_reg, @quantite, @reference, @remarque, @id_raison_mouvement, @id_lot)`);
        return result.recordset[0];
    }

    static async update(id, { quantite, reference, remarque, id_raison_mouvement, id_lot }) {
        const pool = await getConnection();
        
        // Récupérer l'ancien mouvement pour calculer l'impact de la modification
        const oldMovement = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM oeufs_mouvements WHERE id = @id');
        
        if (!oldMovement.recordset[0]) {
            throw new Error('Mouvement introuvable');
        }
        
        const ancienMouvement = oldMovement.recordset[0];
        
        // VÉRIFICATION : Si le nouveau mouvement est négatif, vérifier le stock d'œufs
        if (quantite < 0) {
            const stockResult = await pool.request()
                .input('id_lot', sql.Int, id_lot)
                .query(`
                    SELECT ISNULL(SUM(om.quantite), 0) as stock_oeufs
                    FROM oeufs_mouvements om
                    WHERE om.id_lot = @id_lot
                `);
            
            const stockActuel = stockResult.recordset[0].stock_oeufs;
            // Retirer l'ancien mouvement et appliquer le nouveau
            const stockSansAncien = stockActuel - ancienMouvement.quantite;
            const stockAvecNouveau = stockSansAncien + quantite;
            
            if (stockAvecNouveau < 0) {
                throw new Error(`Stock d'œufs insuffisant pour cette modification. `+
                              `Stock actuel: ${stockActuel}, Nouveau mouvement: ${quantite}, `+
                              `Stock résultant: ${stockAvecNouveau}`);
            }
        }
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('quantite', sql.Int, quantite)
            .input('reference', sql.VarChar(255), reference || null)
            .input('remarque', sql.VarChar(sql.MAX), remarque || null)
            .input('id_raison_mouvement', sql.Int, id_raison_mouvement)
            .input('id_lot', sql.Int, id_lot)
            .query(`UPDATE oeufs_mouvements
                    SET quantite = @quantite, reference = @reference, remarque = @remarque,
                        id_raison_mouvement = @id_raison_mouvement, id_lot = @id_lot
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM oeufs_mouvements WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Mouvements par lot
    static async getByLot(id_lot) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`
                SELECT om.*, rm.libelle as raison_libelle
                FROM oeufs_mouvements om
                JOIN raisons_mouvements rm ON om.id_raison_mouvement = rm.id
                WHERE om.id_lot = @id_lot
                ORDER BY om.date_reg DESC
            `);
        return result.recordset;
    }
}

module.exports = OeufMouvement;

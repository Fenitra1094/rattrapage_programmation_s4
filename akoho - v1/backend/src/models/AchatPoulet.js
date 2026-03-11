const { getConnection, sql } = require('../config/database');

class AchatPoulet {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT ap.*, f.nom as fournisseur_nom, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM achat_poulets ap
                JOIN fournisseurs f ON ap.id_fournisseur = f.id
                JOIN lots l ON ap.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                ORDER BY ap.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT ap.*, f.nom as fournisseur_nom, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM achat_poulets ap
                JOIN fournisseurs f ON ap.id_fournisseur = f.id
                JOIN lots l ON ap.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE ap.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ quantite, prix_unitaire, id_fournisseur, id_lot }) {
        // VÉRIFICATION : La quantité doit être strictement positive
        if (!quantite || quantite <= 0) {
            throw new Error('La quantité doit être strictement positive');
        }
        if (!prix_unitaire || prix_unitaire < 0) {
            throw new Error('Le prix unitaire doit être positif ou nul');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('date_reg', sql.DateTime2, new Date())
            .input('id_fournisseur', sql.Int, id_fournisseur)
            .input('id_lot', sql.Int, id_lot)
            .query(`INSERT INTO achat_poulets (quantite, prix_unitaire, date_reg, id_fournisseur, id_lot)
                    OUTPUT INSERTED.*
                    VALUES (@quantite, @prix_unitaire, @date_reg, @id_fournisseur, @id_lot)`);
        return result.recordset[0];
    }

    static async update(id, { quantite, prix_unitaire, id_fournisseur, id_lot }) {
        // VÉRIFICATION : La quantité doit être strictement positive
        if (!quantite || quantite <= 0) {
            throw new Error('La quantité doit être strictement positive');
        }
        if (!prix_unitaire || prix_unitaire < 0) {
            throw new Error('Le prix unitaire doit être positif ou nul');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('quantite', sql.Int, quantite)
            .input('prix_unitaire', sql.Decimal(15, 2), prix_unitaire)
            .input('id_fournisseur', sql.Int, id_fournisseur)
            .input('id_lot', sql.Int, id_lot)
            .query(`UPDATE achat_poulets
                    SET quantite = @quantite, prix_unitaire = @prix_unitaire,
                        id_fournisseur = @id_fournisseur, id_lot = @id_lot
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM achat_poulets WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Achats par lot
    static async getByLot(id_lot) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`
                SELECT ap.*, f.nom as fournisseur_nom
                FROM achat_poulets ap
                JOIN fournisseurs f ON ap.id_fournisseur = f.id
                WHERE ap.id_lot = @id_lot
                ORDER BY ap.date_reg DESC
            `);
        return result.recordset;
    }

    // Achats par fournisseur
    static async getByFournisseur(id_fournisseur) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_fournisseur', sql.Int, id_fournisseur)
            .query(`
                SELECT ap.*, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM achat_poulets ap
                JOIN lots l ON ap.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE ap.id_fournisseur = @id_fournisseur
                ORDER BY ap.date_reg DESC
            `);
        return result.recordset;
    }

    // Cout total d'achat pour un lot
    static async getCoutTotalByLot(id_lot) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`
                SELECT ISNULL(SUM(quantite * prix_unitaire), 0) as cout_total,
                       ISNULL(SUM(quantite), 0) as quantite_totale
                FROM achat_poulets
                WHERE id_lot = @id_lot
            `);
        return result.recordset[0];
    }
}

module.exports = AchatPoulet;

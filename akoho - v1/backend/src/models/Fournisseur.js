const { getConnection, sql } = require('../config/database');

class Fournisseur {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM fournisseurs ORDER BY id');
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM fournisseurs WHERE id = @id');
        return result.recordset[0];
    }

    static async create(nom) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nom', sql.VarChar(124), nom)
            .query('INSERT INTO fournisseurs (nom) OUTPUT INSERTED.* VALUES (@nom)');
        return result.recordset[0];
    }

    static async update(id, nom) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nom', sql.VarChar(124), nom)
            .query('UPDATE fournisseurs SET nom = @nom OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM fournisseurs WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Récupérer les achats d'un fournisseur
    static async getAchats(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT ap.*, l.date_arrivee, l.age, r.libelle as race_libelle
                FROM achat_poulets ap
                JOIN lots l ON ap.id_lot = l.id
                JOIN races r ON l.id_race = r.id
                WHERE ap.id_fournisseur = @id
                ORDER BY ap.date_reg DESC
            `);
        return result.recordset;
    }
}

module.exports = Fournisseur;

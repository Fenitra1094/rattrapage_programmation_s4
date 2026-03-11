const { getConnection, sql } = require('../config/database');

class Race {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM races ORDER BY id');
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM races WHERE id = @id');
        return result.recordset[0];
    }

    static async create(libelle) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('libelle', sql.VarChar(255), libelle)
            .query('INSERT INTO races (libelle) OUTPUT INSERTED.* VALUES (@libelle)');
        return result.recordset[0];
    }

    static async update(id, libelle) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('libelle', sql.VarChar(255), libelle)
            .query('UPDATE races SET libelle = @libelle OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM races WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Récupérer une race avec ses derniers prix et configurations
    static async getWithDetails(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT r.*,
                    (SELECT TOP 1 prix FROM prix_nourritures WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_nourriture,
                    (SELECT TOP 1 prix FROM prix_vente_oeufs WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_vente_oeufs,
                    (SELECT TOP 1 prix FROM prix_vente_poulets WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_vente_poulets
                FROM races r
                WHERE r.id = @id
            `);
        return result.recordset[0];
    }

    // Récupérer toutes les races avec un résumé
    static async getAllWithSummary() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT r.*,
                    (SELECT COUNT(*) FROM lots WHERE id_race = r.id) as nombre_lots,
                    (SELECT TOP 1 prix FROM prix_nourritures WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_nourriture,
                    (SELECT TOP 1 prix FROM prix_vente_oeufs WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_vente_oeufs,
                    (SELECT TOP 1 prix FROM prix_vente_poulets WHERE id_race = r.id ORDER BY date_reg DESC) as dernier_prix_vente_poulets
                FROM races r
                ORDER BY r.id
            `);
        return result.recordset;
    }
}

module.exports = Race;

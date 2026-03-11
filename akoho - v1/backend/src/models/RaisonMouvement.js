const { getConnection, sql } = require('../config/database');

class RaisonMouvement {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM raisons_mouvements ORDER BY id');
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM raisons_mouvements WHERE id = @id');
        return result.recordset[0];
    }

    static async create(libelle) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('libelle', sql.VarChar(200), libelle)
            .query('INSERT INTO raisons_mouvements (libelle) OUTPUT INSERTED.* VALUES (@libelle)');
        return result.recordset[0];
    }

    static async update(id, libelle) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('libelle', sql.VarChar(200), libelle)
            .query('UPDATE raisons_mouvements SET libelle = @libelle OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM raisons_mouvements WHERE id = @id');
        return result.rowsAffected[0];
    }
}

module.exports = RaisonMouvement;

const { getConnection, sql } = require('../config/database');

class PrixVenteOeufs {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT pvo.*, r.libelle as race_libelle
                FROM prix_vente_oeufs pvo
                JOIN races r ON pvo.id_race = r.id
                ORDER BY pvo.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT pvo.*, r.libelle as race_libelle
                FROM prix_vente_oeufs pvo
                JOIN races r ON pvo.id_race = r.id
                WHERE pvo.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ prix, id_race }) {
        // VÉRIFICATION : Le prix ne peut pas être négatif
        if (prix < 0) {
            throw new Error('Le prix ne peut pas être négatif');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('prix', sql.Decimal(15, 2), prix)
            .input('date_reg', sql.DateTime2, new Date())
            .input('id_race', sql.Int, id_race)
            .query('INSERT INTO prix_vente_oeufs (prix, date_reg, id_race) OUTPUT INSERTED.* VALUES (@prix, @date_reg, @id_race)');
        return result.recordset[0];
    }

    static async update(id, { prix, id_race }) {
        // VÉRIFICATION : Le prix ne peut pas être négatif
        if (prix < 0) {
            throw new Error('Le prix ne peut pas être négatif');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('prix', sql.Decimal(15, 2), prix)
            .input('id_race', sql.Int, id_race)
            .query('UPDATE prix_vente_oeufs SET prix = @prix, id_race = @id_race OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM prix_vente_oeufs WHERE id = @id');
        return result.rowsAffected[0];
    }

    static async getLatestByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT TOP 1 pvo.*, r.libelle as race_libelle
                FROM prix_vente_oeufs pvo
                JOIN races r ON pvo.id_race = r.id
                WHERE pvo.id_race = @id_race
                ORDER BY pvo.date_reg DESC
            `);
        return result.recordset[0];
    }

    static async getByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT pvo.*, r.libelle as race_libelle
                FROM prix_vente_oeufs pvo
                JOIN races r ON pvo.id_race = r.id
                WHERE pvo.id_race = @id_race
                ORDER BY pvo.date_reg DESC
            `);
        return result.recordset;
    }
}

module.exports = PrixVenteOeufs;

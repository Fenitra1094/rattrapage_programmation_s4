const { getConnection, sql } = require('../config/database');

class PrixNourriture {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT pn.*, r.libelle as race_libelle
                FROM prix_nourritures pn
                JOIN races r ON pn.id_race = r.id
                ORDER BY pn.date_reg DESC
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT pn.*, r.libelle as race_libelle
                FROM prix_nourritures pn
                JOIN races r ON pn.id_race = r.id
                WHERE pn.id = @id
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
            .query('INSERT INTO prix_nourritures (prix, date_reg, id_race) OUTPUT INSERTED.* VALUES (@prix, @date_reg, @id_race)');
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
            .query('UPDATE prix_nourritures SET prix = @prix, id_race = @id_race OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM prix_nourritures WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Récupérer le dernier prix par race
    static async getLatestByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT TOP 1 pn.*, r.libelle as race_libelle
                FROM prix_nourritures pn
                JOIN races r ON pn.id_race = r.id
                WHERE pn.id_race = @id_race
                ORDER BY pn.date_reg DESC
            `);
        return result.recordset[0];
    }

    // Historique des prix par race
    static async getByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT pn.*, r.libelle as race_libelle
                FROM prix_nourritures pn
                JOIN races r ON pn.id_race = r.id
                WHERE pn.id_race = @id_race
                ORDER BY pn.date_reg DESC
            `);
        return result.recordset;
    }
}

module.exports = PrixNourriture;

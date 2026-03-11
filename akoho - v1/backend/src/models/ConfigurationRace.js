const { getConnection, sql } = require('../config/database');

class ConfigurationRace {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT cr.*, r.libelle as race_libelle
                FROM configuration_races cr
                JOIN races r ON cr.id_race = r.id
                ORDER BY cr.id_race, cr.num_semaine
            `);
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT cr.*, r.libelle as race_libelle
                FROM configuration_races cr
                JOIN races r ON cr.id_race = r.id
                WHERE cr.id = @id
            `);
        return result.recordset[0];
    }

    static async create({ num_semaine, consommation_nourriture, augmentation_poids, id_race }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('num_semaine', sql.Int, num_semaine)
            .input('consommation_nourriture', sql.Decimal(15, 2), consommation_nourriture)
            .input('augmentation_poids', sql.Decimal(15, 2), augmentation_poids)
            .input('id_race', sql.Int, id_race)
            .query(`INSERT INTO configuration_races (num_semaine, consommation_nourriture, augmentation_poids, id_race)
                    OUTPUT INSERTED.*
                    VALUES (@num_semaine, @consommation_nourriture, @augmentation_poids, @id_race)`);
        return result.recordset[0];
    }

    static async update(id, { num_semaine, consommation_nourriture, augmentation_poids, id_race }) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('num_semaine', sql.Int, num_semaine)
            .input('consommation_nourriture', sql.Decimal(15, 2), consommation_nourriture)
            .input('augmentation_poids', sql.Decimal(15, 2), augmentation_poids)
            .input('id_race', sql.Int, id_race)
            .query(`UPDATE configuration_races
                    SET num_semaine = @num_semaine,
                        consommation_nourriture = @consommation_nourriture,
                        augmentation_poids = @augmentation_poids,
                        id_race = @id_race
                    OUTPUT INSERTED.*
                    WHERE id = @id`);
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM configuration_races WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Récupérer toute la configuration d'une race (semaines ordonnées)
    static async getByRace(id_race) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`
                SELECT cr.*, r.libelle as race_libelle
                FROM configuration_races cr
                JOIN races r ON cr.id_race = r.id
                WHERE cr.id_race = @id_race
                ORDER BY cr.num_semaine
            `);
        return result.recordset;
    }

    // Estimer le poids d'un poulet à une semaine donnée
    static async estimerPoids(id_race, num_semaine) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .input('num_semaine', sql.Int, num_semaine)
            .query(`
                SELECT ISNULL(SUM(augmentation_poids), 0) as poids_estime
                FROM configuration_races
                WHERE id_race = @id_race AND num_semaine <= @num_semaine
            `);
        return result.recordset[0];
    }

    // Estimer la consommation totale de nourriture jusqu'à une semaine donnée
    static async estimerConsommation(id_race, num_semaine) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .input('num_semaine', sql.Int, num_semaine)
            .query(`
                SELECT ISNULL(SUM(consommation_nourriture), 0) as consommation_totale
                FROM configuration_races
                WHERE id_race = @id_race AND num_semaine <= @num_semaine
            `);
        return result.recordset[0];
    }
}

module.exports = ConfigurationRace;

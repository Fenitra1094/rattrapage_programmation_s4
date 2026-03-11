const { getConnection, sql } = require('../config/database');

class Client {
    static async getAll() {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM clients ORDER BY id');
        return result.recordset;
    }

    static async getById(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM clients WHERE id = @id');
        return result.recordset[0];
    }

    static async create(nom) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('nom', sql.VarChar(124), nom)
            .query('INSERT INTO clients (nom) OUTPUT INSERTED.* VALUES (@nom)');
        return result.recordset[0];
    }

    static async update(id, nom) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nom', sql.VarChar(124), nom)
            .query('UPDATE clients SET nom = @nom OUTPUT INSERTED.* WHERE id = @id');
        return result.recordset[0];
    }

    static async delete(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM clients WHERE id = @id');
        return result.rowsAffected[0];
    }

    // Historique des ventes d'un client
    static async getVentes(id) {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 'poulets' as type_vente, vp.id, vp.date_reg,
                    (SELECT SUM(vpd.quantite * vpd.prix_unitaire) FROM vente_poulets_details vpd WHERE vpd.id_vente_poulet = vp.id) as montant_total
                FROM vente_poulets vp WHERE vp.id_clients = @id
                UNION ALL
                SELECT 'oeufs' as type_vente, vo.id, vo.date_reg,
                    (SELECT SUM(vod.quantite * vod.prix_unitaire) FROM vente_oeufs_details vod WHERE vod.id_vente_oeufs = vo.id) as montant_total
                FROM vente_oeufs vo WHERE vo.id_clients = @id
                ORDER BY date_reg DESC
            `);
        return result.recordset;
    }
}

module.exports = Client;

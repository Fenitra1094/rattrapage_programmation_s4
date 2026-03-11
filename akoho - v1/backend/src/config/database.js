const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true, // Pour Azure ou connexions sécurisées
        trustServerCertificate: true // Pour le développement local
    }
};

let pool = null;

async function getConnection() {
    try {
        if (pool) {
            console.log('Utilisation de la connexion existante');
            return pool;
        }
        
        pool = await sql.connect(config);
        console.log('Connecté à SQL Server');
        return pool;
    } catch (err) {
        console.error('Erreur de connexion:', err);
        throw err;
    }
}

module.exports = {
    getConnection,
    sql
};
const { getConnection, sql } = require('../config/database');
const Lot = require('../models/Lot');

const dashboardController = {
    async getStats(req, res) {
        try {
            const { dateMin, dateMax } = req.query;
            if (!dateMin || !dateMax) {
                return res.status(400).json({ message: 'dateMin et dateMax sont requis (format YYYY-MM-DD)' });
            }

            const dMin = new Date(dateMin);
            const dMax = new Date(dateMax);
            const pool = await getConnection();

            // 1. Récupérer tous les lots qui existaient déjà dans l'intervalle
            const lotsResult = await pool.request()
                .input('dateMax', sql.Date, dMax)
                .query(`
                    SELECT l.*, r.libelle as race_libelle
                    FROM lots l
                    JOIN races r ON l.id_race = r.id
                    WHERE l.date_arrivee <= @dateMax
                    ORDER BY l.id
                `);
            const lots = lotsResult.recordset;

            const lotsStats = [];
            let totalPoulets = 0, totalOeufs = 0;
            let totalCaVentePoulets = 0, totalCaVenteOeufs = 0;
            let totalDepensesNourriture = 0, totalDepensesAchats = 0;
            console.log("DASHBOOOOOOOOOARD");
            for (const lot of lots) {
                // nb poulets à dateMax
                const stockPoulets = await pool.request()
                    .input('id_lot', sql.Int, lot.id)
                    .input('dateMax', sql.DateTime2, dMax)
                    .query(`
                        SELECT ISNULL(SUM(lm.quantite), 0) as nb
                        FROM lots_mouvements lm
                        WHERE lm.id_lot = @id_lot AND lm.date_reg <= @dateMax
                    `);
                const nb_poulets = stockPoulets.recordset[0].nb;

                // nb oeufs à dateMax
                const stockOeufs = await pool.request()
                    .input('id_lot', sql.Int, lot.id)
                    .input('dateMax', sql.DateTime2, dMax)
                    .query(`
                        SELECT ISNULL(SUM(om.quantite), 0) as nb
                        FROM oeufs_mouvements om
                        WHERE om.id_lot = @id_lot AND om.date_reg <= @dateMax
                    `);
                const nb_oeufs = stockOeufs.recordset[0].nb;

                // CA vente poulets dans l'intervalle
                const caVP = await pool.request()
                    .input('id_lot', sql.Int, lot.id)
                    .input('dateMin', sql.DateTime2, dMin)
                    .input('dateMax', sql.DateTime2, dMax)
                    .query(`
                        SELECT ISNULL(SUM(vpd.quantite * vpd.prix_unitaire), 0) as ca
                        FROM vente_poulets_details vpd
                        JOIN vente_poulets vp ON vpd.id_vente_poulet = vp.id
                        WHERE vpd.id_lot = @id_lot
                          AND vp.date_reg BETWEEN @dateMin AND @dateMax
                    `);
                const ca_vente_poulets = parseFloat(caVP.recordset[0].ca);

                // CA vente oeufs dans l'intervalle
                const caVO = await pool.request()
                    .input('id_lot', sql.Int, lot.id)
                    .input('dateMin', sql.DateTime2, dMin)
                    .input('dateMax', sql.DateTime2, dMax)
                    .query(`
                        SELECT ISNULL(SUM(vod.quantite * vod.prix_unitaire), 0) as ca
                        FROM vente_oeufs_details vod
                        JOIN vente_oeufs vo ON vod.id_vente_oeufs = vo.id
                        WHERE vod.id_lot = @id_lot
                          AND vo.date_reg BETWEEN @dateMin AND @dateMax
                    `);
                const ca_vente_oeufs = parseFloat(caVO.recordset[0].ca);

                // Dépenses achats poulets dans l'intervalle
                const depAchats = await pool.request()
                    .input('id_lot', sql.Int, lot.id)
                    .input('dateMin', sql.DateTime2, dMin)
                    .input('dateMax', sql.DateTime2, dMax)
                    .query(`
                        SELECT ISNULL(SUM(ap.quantite * ap.prix_unitaire), 0) as dep
                        FROM achat_poulets ap
                        WHERE ap.id_lot = @id_lot
                          AND ap.date_reg BETWEEN @dateMin AND @dateMax
                    `);
                const depenses_achats = parseFloat(depAchats.recordset[0].dep);

                // Dépenses nourriture : boucle jour par jour
                const startDate = new Date(Math.max(dMin.getTime(), new Date(lot.date_arrivee).getTime()));
                let depenses_nourriture = 0;
                const currentDate = new Date(startDate);
                console.log("start-date:"+startDate);
                while (currentDate <= dMax) {
                    const conso = await Lot.getConsommationNourriture(lot.id, new Date(currentDate));
                    console.log("Date:"+currentDate+"/conso:",conso);
                    if (conso) {
                        depenses_nourriture += conso.cout_total;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                depenses_nourriture = parseFloat(depenses_nourriture.toFixed(2));

                const benefice_net = parseFloat((ca_vente_poulets + ca_vente_oeufs - depenses_nourriture - depenses_achats).toFixed(2));

                lotsStats.push({
                    id: lot.id,
                    date_arrivee: lot.date_arrivee,
                    race_libelle: lot.race_libelle,
                    nb_poulets,
                    nb_oeufs,
                    ca_vente_poulets,
                    ca_vente_oeufs,
                    depenses_nourriture,
                    depenses_achats,
                    benefice_net
                });

                totalPoulets += nb_poulets;
                totalOeufs += nb_oeufs;
                totalCaVentePoulets += ca_vente_poulets;
                totalCaVenteOeufs += ca_vente_oeufs;
                totalDepensesNourriture += depenses_nourriture;
                totalDepensesAchats += depenses_achats;
            }

            const totalBenefice = parseFloat((totalCaVentePoulets + totalCaVenteOeufs - totalDepensesNourriture - totalDepensesAchats).toFixed(2));

            res.json({
                resume: {
                    total_poulets: totalPoulets,
                    total_oeufs: totalOeufs,
                    ca_vente_poulets: parseFloat(totalCaVentePoulets.toFixed(2)),
                    ca_vente_oeufs: parseFloat(totalCaVenteOeufs.toFixed(2)),
                    depenses_nourriture: parseFloat(totalDepensesNourriture.toFixed(2)),
                    depenses_achats: parseFloat(totalDepensesAchats.toFixed(2)),
                    benefice_net: totalBenefice
                },
                lots: lotsStats
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = dashboardController;

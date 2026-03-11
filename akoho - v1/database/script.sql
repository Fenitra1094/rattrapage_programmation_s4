CREATE DATABASE akoho;
GO

USE akoho;
GO

CREATE TABLE races(
   id INT IDENTITY,
   libelle VARCHAR(255),
   PRIMARY KEY(id)
);
GO

CREATE TABLE configurations(
   id INT IDENTITY,
   valeur VARCHAR(255) NOT NULL,
   code VARCHAR(124) NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(code)
);
GO

CREATE TABLE prix_nourritures(
   id INT IDENTITY,
   prix DECIMAL(15,2) NOT NULL,
   date_reg DATETIME2 NOT NULL,
   id_race INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_race) REFERENCES races(id)
);
GO

CREATE TABLE configuration_races(
   id INT IDENTITY,
   num_semaine INT NOT NULL,
   consommation_nourriture DECIMAL(15,2),
   augmentation_poids DECIMAL(15,2),
   id_race INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_race) REFERENCES races(id)
);
GO

CREATE TABLE prix_vente_oeufs(
   id INT IDENTITY,
   prix DECIMAL(15,2) NOT NULL,
   date_reg DATETIME2 NOT NULL,
   id_race INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_race) REFERENCES races(id)
);
GO

CREATE TABLE raisons_mouvements(
   id INT IDENTITY,
   libelle VARCHAR(200),
   PRIMARY KEY(id)
);
GO

CREATE TABLE prix_vente_poulets(
   id INT IDENTITY,
   prix DECIMAL(15,2) NOT NULL,
   date_reg DATETIME2 NOT NULL,
   id_race INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_race) REFERENCES races(id)
);
GO

CREATE TABLE fournisseurs(
   id INT IDENTITY,
   nom VARCHAR(124),
   PRIMARY KEY(id)
);
GO

CREATE TABLE clients(
   id INT IDENTITY,
   nom VARCHAR(124),
   PRIMARY KEY(id)
);
GO

CREATE TABLE vente_oeufs(
   id INT IDENTITY,
   date_reg DATETIME2 NOT NULL,
   id_client INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_client) REFERENCES clients(id)
);
GO

CREATE TABLE vente_poulets(
   id INT IDENTITY,
   date_reg DATETIME2 NOT NULL,
   id_client INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_client) REFERENCES clients(id)
);
GO

CREATE TABLE lots(
   id INT IDENTITY,
   date_arrivee DATE NOT NULL,
   age INT NOT NULL,
   poids_initial DECIMAL(15,2) NOT NULL,
   id_race INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_race) REFERENCES races(id)
);
GO

CREATE TABLE lots_mouvements(
   id INT IDENTITY,
   date_reg DATETIME2 NOT NULL,
   quantite INT NOT NULL,
   reference VARCHAR(255),
   remarque VARCHAR(max),
   id_lot INT NOT NULL,
   id_raison_mouvement INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_lot) REFERENCES lots(id),
   FOREIGN KEY(id_raison_mouvement) REFERENCES raisons_mouvements(id)
);
GO

CREATE TABLE achat_poulets(
   id INT IDENTITY,
   quantite INT NOT NULL,
   prix_unitaire DECIMAL(15,2) NOT NULL,
   date_reg DATETIME2 NOT NULL,
   id_fournisseur INT NOT NULL,
   id_lot INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_fournisseur) REFERENCES fournisseurs(id),
   FOREIGN KEY(id_lot) REFERENCES lots(id)
);
GO

CREATE TABLE oeufs_mouvements(
   id INT IDENTITY,
   date_reg DATETIME2 NOT NULL,
   quantite INT NOT NULL,
   reference VARCHAR(255),
   remarque VARCHAR(max),
   id_raison_mouvement INT NOT NULL,
   id_lot INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_raison_mouvement) REFERENCES raisons_mouvements(id),
   FOREIGN KEY(id_lot) REFERENCES lots(id)
);
GO

CREATE TABLE vente_poulets_details(
   id INT IDENTITY,
   quantite INT NOT NULL,
   prix_unitaire DECIMAL(15,2) NOT NULL,
   id_lot INT NOT NULL,
   id_vente_poulet INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_lot) REFERENCES lots(id),
   FOREIGN KEY(id_vente_poulet) REFERENCES vente_poulets(id)
);
GO

CREATE TABLE vente_oeufs_details(
   id INT IDENTITY,
   quantite INT NOT NULL,
   prix_unitaire DECIMAL(15,2) NOT NULL,
   id_vente_oeufs INT NOT NULL,
   id_lot INT NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_vente_oeufs) REFERENCES vente_oeufs(id),
   FOREIGN KEY(id_lot) REFERENCES lots(id)
);
GO

INSERT INTO fournisseurs(nom) VALUES ('default supplier');
INSERT INTO clients(nom) VALUES ('default client');
INSERT INTO races(libelle) VALUES 
('R1'),
('R2'),
('R3');

INSERT INTO raisons_mouvements(libelle) VALUES 
('Achat initial'),
('Mort'),
('Perte'),
('Peremption oeufs'),
('Destruction oeufs'),
('Eclosion oeufs');

INSERT INTO configurations(code,valeur) VALUES 
('TMP-INCUB','45');


-- Configuration pour la race R1 (id_race = 1)
INSERT INTO configuration_races(num_semaine, consommation_nourriture, augmentation_poids, id_race) VALUES 
(0, 150, 50, 1),
(1, 200, 100, 1),
(2, 250, 150, 1),
(3, 300, 200, 1),
(4, 350, 250, 1),
(5, 400, 300, 1),
(6, 450, 250, 1),
(7, 500, 200, 1),
(8, 500, 150, 1),
(9, 450, 100, 1),
(10, 400, 80, 1);

-- Configuration pour la race R2 (id_race = 2)
INSERT INTO configuration_races(num_semaine, consommation_nourriture, augmentation_poids, id_race) VALUES 
(0, 120, 40, 2),
(1, 180, 90, 2),
(2, 220, 130, 2),
(3, 280, 180, 2),
(4, 320, 220, 2),
(5, 380, 280, 2),
(6, 420, 230, 2),
(7, 480, 180, 2),
(8, 480, 140, 2),
(9, 420, 90, 2),
(10, 380, 60, 2);

-- Configuration pour la race R3 (id_race = 3)
INSERT INTO configuration_races(num_semaine, consommation_nourriture, augmentation_poids, id_race) VALUES 
(0, 180, 60, 3),
(1, 250, 120, 3),
(2, 300, 180, 3),
(3, 350, 240, 3),
(4, 400, 300, 3),
(5, 450, 350, 3),
(6, 500, 300, 3),
(7, 550, 250, 3),
(8, 550, 200, 3),
(9, 500, 150, 3),
(10, 450, 100, 3);


-- Prix de la nourriture (par kg) - Variation saisonnière
INSERT INTO prix_nourritures(prix, date_reg, id_race) VALUES 
-- Année 2024
(450, '2024-01-15', 1), (460, '2024-02-15', 1), (470, '2024-03-15', 1), (480, '2024-04-15', 1),
(500, '2024-05-15', 1), (520, '2024-06-15', 1), (550, '2024-07-15', 1), (530, '2024-08-15', 1),
(510, '2024-09-15', 1), (490, '2024-10-15', 1), (470, '2024-11-15', 1), (460, '2024-12-15', 1),
-- Année 2025
(470, '2025-01-15', 1), (480, '2025-02-15', 1), (500, '2025-03-15', 1), (520, '2025-04-15', 1),
(540, '2025-05-15', 1), (560, '2025-06-15', 1), (580, '2025-07-15', 1), (570, '2025-08-15', 1),
(550, '2025-09-15', 1), (530, '2025-10-15', 1), (500, '2025-11-15', 1), (480, '2025-12-15', 1);

-- Prix différents selon les races (alimentation spécialisée)
INSERT INTO prix_nourritures(prix, date_reg, id_race) VALUES 
-- Race R2 (alimentation standard)
(430, '2024-01-15', 2), (440, '2024-02-15', 2), (450, '2024-03-15', 2), (460, '2024-04-15', 2),
(480, '2024-05-15', 2), (500, '2024-06-15', 2), (520, '2024-07-15', 2), (510, '2024-08-15', 2),
(490, '2024-09-15', 2), (470, '2024-10-15', 2), (450, '2024-11-15', 2), (440, '2024-12-15', 2),
(450, '2025-01-15', 2), (460, '2025-02-15', 2), (480, '2025-03-15', 2), (500, '2025-04-15', 2),
(520, '2025-05-15', 2), (540, '2025-06-15', 2), (560, '2025-07-15', 2), (550, '2025-08-15', 2),
(530, '2025-09-15', 2), (510, '2025-10-15', 2), (480, '2025-11-15', 2), (460, '2025-12-15', 2),

-- Race R3 (alimentation premium)
(500, '2024-01-15', 3), (510, '2024-02-15', 3), (520, '2024-03-15', 3), (530, '2024-04-15', 3),
(550, '2024-05-15', 3), (580, '2024-06-15', 3), (600, '2024-07-15', 3), (590, '2024-08-15', 3),
(570, '2024-09-15', 3), (550, '2024-10-15', 3), (530, '2024-11-15', 3), (510, '2024-12-15', 3),
(520, '2025-01-15', 3), (530, '2025-02-15', 3), (550, '2025-03-15', 3), (570, '2025-04-15', 3),
(600, '2025-05-15', 3), (620, '2025-06-15', 3), (650, '2025-07-15', 3), (630, '2025-08-15', 3),
(610, '2025-09-15', 3), (590, '2025-10-15', 3), (560, '2025-11-15', 3), (540, '2025-12-15', 3);

-- Prix de vente des oeufs (par œuf)
INSERT INTO prix_vente_oeufs(prix, date_reg, id_race) VALUES 
-- Race R1 (œufs standards)
(250, '2024-01-15', 1), (260, '2024-04-15', 1), (270, '2024-07-15', 1), (280, '2024-10-15', 1),
(290, '2025-01-15', 1), (300, '2025-04-15', 1), (310, '2025-07-15', 1), (320, '2025-10-15', 1),

-- Race R2 (œufs moyens)
(220, '2024-01-15', 2), (230, '2024-04-15', 2), (240, '2024-07-15', 2), (250, '2024-10-15', 2),
(260, '2025-01-15', 2), (270, '2025-04-15', 2), (280, '2025-07-15', 2), (290, '2025-10-15', 2),

-- Race R3 (œufs gros calibre)
(300, '2024-01-15', 3), (320, '2024-04-15', 3), (340, '2024-07-15', 3), (360, '2024-10-15', 3),
(380, '2025-01-15', 3), (400, '2025-04-15', 3), (420, '2025-07-15', 3), (440, '2025-10-15', 3);

-- Prix de vente des poulets (par gramme)
INSERT INTO prix_vente_poulets(prix, date_reg, id_race) VALUES 
-- Race R1 (poulets standards)
(3.5, '2024-01-15', 1), (3.6, '2024-04-15', 1), (3.7, '2024-07-15', 1), (3.8, '2024-10-15', 1),
(3.9, '2025-01-15', 1), (4.0, '2025-04-15', 1), (4.1, '2025-07-15', 1), (4.2, '2025-10-15', 1),

-- Race R2 (poulets légers)
(3.2, '2024-01-15', 2), (3.3, '2024-04-15', 2), (3.4, '2024-07-15', 2), (3.5, '2024-10-15', 2),
(3.6, '2025-01-15', 2), (3.7, '2025-04-15', 2), (3.8, '2025-07-15', 2), (3.9, '2025-10-15', 2),

-- Race R3 (poulets de qualité supérieure)
(4.0, '2024-01-15', 3), (4.2, '2024-04-15', 3), (4.4, '2024-07-15', 3), (4.6, '2024-10-15', 3),
(4.8, '2025-01-15', 3), (5.0, '2025-04-15', 3), (5.2, '2025-07-15', 3), (5.4, '2025-10-15', 3);







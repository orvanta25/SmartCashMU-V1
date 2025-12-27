-- Création d'un utilisateur dédié (optionnel mais recommandé)
CREATE USER smartcash_user WITH PASSWORD 'smartcash_password';
CREATE DATABASE smartcash_central;
GRANT ALL PRIVILEGES ON DATABASE smartcash_central TO smartcash_user;

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
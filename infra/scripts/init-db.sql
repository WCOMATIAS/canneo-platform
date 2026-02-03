-- init-db.sql - Script de inicialização do PostgreSQL
-- Executado automaticamente na primeira inicialização do container

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Criar schema para teste (opcional)
-- CREATE SCHEMA IF NOT EXISTS canneo_test;

-- Configurações de performance para desenvolvimento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'CANNEO Database initialized successfully!';
END $$;

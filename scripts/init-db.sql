-- ============================================================================
-- CANNEO - Script de inicialização do banco de dados
-- ============================================================================
-- Este script é executado automaticamente quando o container PostgreSQL
-- é criado pela primeira vez.
-- ============================================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurações de performance para desenvolvimento
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '512MB';
ALTER SYSTEM SET work_mem = '16MB';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'CANNEO Database initialized successfully!';
  RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto';
  RAISE NOTICE '============================================';
END $$;

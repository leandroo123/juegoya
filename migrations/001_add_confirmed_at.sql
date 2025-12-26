-- ============================================
-- FASE 1: CONFIRMACIÓN DE ASISTENCIA
-- ============================================

-- Agregar columna confirmed_at a match_players
ALTER TABLE match_players 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Verificar que se agregó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_players' 
AND column_name = 'confirmed_at';

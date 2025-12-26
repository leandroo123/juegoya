-- ============================================
-- SCRIPTS DE LIMPIEZA DE BASE DE DATOS
-- ============================================
-- ADVERTENCIA: Estos scripts eliminan TODOS los datos
-- Usar solo en desarrollo/testing
-- ============================================

-- SCRIPT 1: Eliminar todos los partidos
-- ============================================
-- Este script elimina todos los partidos y sus inscripciones

-- Paso 1: Eliminar todas las inscripciones de jugadores
DELETE FROM match_players;

-- Paso 2: Eliminar todos los partidos
DELETE FROM matches;

-- Verificar que se eliminaron todos
SELECT COUNT(*) as total_partidos FROM matches;
SELECT COUNT(*) as total_inscripciones FROM match_players;
-- Ambos deben mostrar 0


-- ============================================
-- SCRIPT 2: Eliminar todos los perfiles
-- ============================================
-- Este script elimina todos los perfiles de usuarios

DELETE FROM profiles;

-- Verificar
SELECT COUNT(*) as total_perfiles FROM profiles;
-- Debe mostrar 0


-- ============================================
-- SCRIPT 3: Eliminar usuarios de Authentication
-- ============================================
-- IMPORTANTE: Este script NO funciona desde SQL Editor
-- Los usuarios de auth.users deben eliminarse desde el Dashboard

-- Para eliminar usuarios:
-- 1. Ir a Authentication → Users en Supabase Dashboard
-- 2. Seleccionar todos los usuarios (checkbox en header)
-- 3. Click en "Delete users"
-- 4. Confirmar


-- ============================================
-- SCRIPT COMPLETO: Limpiar todo
-- ============================================
-- Ejecutar en este orden:

-- 1. Eliminar inscripciones
DELETE FROM match_players;

-- 2. Eliminar partidos
DELETE FROM matches;

-- 3. Eliminar perfiles
DELETE FROM profiles;

-- 4. Ir al Dashboard para eliminar usuarios de Authentication


-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM match_players) as inscripciones,
  (SELECT COUNT(*) FROM matches) as partidos,
  (SELECT COUNT(*) FROM profiles) as perfiles;
-- Todo debe mostrar 0

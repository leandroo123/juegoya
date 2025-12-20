-- =====================================================
-- JUEGOYA MVP - RPC FUNCTIONS
-- =====================================================

-- RPC: join_match (atómico con lock)
CREATE OR REPLACE FUNCTION join_match(
  p_match_id UUID,
  p_prefer_substitute BOOLEAN DEFAULT FALSE
)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_total_slots INTEGER;
  v_current_count INTEGER;
  v_existing_role TEXT;
  v_assigned_role TEXT;
BEGIN
  -- Obtener user_id del contexto auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock del match para evitar race conditions
  SELECT total_slots INTO v_total_slots
  FROM matches
  WHERE id = p_match_id AND status = 'open'
  FOR UPDATE;

  IF v_total_slots IS NULL THEN
    RAISE EXCEPTION 'Match not found or not open';
  END IF;

  -- Verificar si ya está anotado
  SELECT role INTO v_existing_role
  FROM match_players
  WHERE match_id = p_match_id AND user_id = v_user_id AND canceled_at IS NULL;

  IF v_existing_role IS NOT NULL THEN
    -- Ya está anotado, devolver rol actual (idempotente)
    RETURN v_existing_role;
  END IF;

  -- Contar cupos ocupados (titulares activos)
  SELECT COUNT(*) INTO v_current_count
  FROM match_players
  WHERE match_id = p_match_id AND role = 'signed_up' AND canceled_at IS NULL;

  -- Decidir rol
  IF p_prefer_substitute OR v_current_count >= v_total_slots THEN
    v_assigned_role := 'substitute';
  ELSE
    v_assigned_role := 'signed_up';
  END IF;

  -- Insertar o actualizar (si había cancelado antes, reactivar)
  INSERT INTO match_players (match_id, user_id, role, joined_at, canceled_at, confirmed_at)
  VALUES (p_match_id, v_user_id, v_assigned_role, NOW(), NULL, NULL)
  ON CONFLICT (match_id, user_id)
  DO UPDATE SET
    role = v_assigned_role,
    joined_at = NOW(),
    canceled_at = NULL,
    confirmed_at = NULL;

  RETURN v_assigned_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- RPC: leave_match
CREATE OR REPLACE FUNCTION leave_match(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE match_players
  SET canceled_at = NOW()
  WHERE match_id = p_match_id AND user_id = v_user_id AND canceled_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not joined or already canceled';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- RPC: confirm_attendance (solo dentro de ventana 6h antes)
CREATE OR REPLACE FUNCTION confirm_attendance(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_starts_at TIMESTAMPTZ;
  v_role TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Obtener starts_at del match
  SELECT starts_at INTO v_starts_at
  FROM matches
  WHERE id = p_match_id;

  IF v_starts_at IS NULL THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  -- Validar ventana de confirmación (6h antes hasta inicio)
  IF NOW() < (v_starts_at - INTERVAL '6 hours') OR NOW() > v_starts_at THEN
    RAISE EXCEPTION 'Confirmation window not open (6h before to start time)';
  END IF;

  -- Verificar que sea titular activo
  SELECT role INTO v_role
  FROM match_players
  WHERE match_id = p_match_id AND user_id = v_user_id AND canceled_at IS NULL;

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Not joined to this match';
  END IF;

  IF v_role != 'signed_up' THEN
    RAISE EXCEPTION 'Only signed_up players can confirm';
  END IF;

  -- Confirmar
  UPDATE match_players
  SET confirmed_at = NOW()
  WHERE match_id = p_match_id AND user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Grants para funciones (con firma completa)
GRANT EXECUTE ON FUNCTION join_match(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_match(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_attendance(UUID) TO authenticated;

-- =====================================================
-- JUEGOYA MVP - RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- PROFILES: usuarios autenticados pueden ver todos los perfiles (para mostrar jugadores)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- PROFILES: usuarios solo pueden insertar/actualizar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- MATCHES: acceso público (anon + authenticated) para compartir link
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  TO anon, authenticated
  USING (true);

-- MATCHES: solo usuarios autenticados pueden crear
CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- MATCHES: solo el organizador puede actualizar
CREATE POLICY "Organizers can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- MATCH_PLAYERS: usuarios autenticados pueden ver jugadores
CREATE POLICY "Match players are viewable by authenticated users"
  ON match_players FOR SELECT
  TO authenticated
  USING (true);

-- MATCH_PLAYERS: usuarios pueden unirse (via RPC, pero necesitamos policy)
CREATE POLICY "Users can join matches"
  ON match_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- MATCH_PLAYERS: usuarios pueden actualizar su propia participación
CREATE POLICY "Users can update their own participation"
  ON match_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

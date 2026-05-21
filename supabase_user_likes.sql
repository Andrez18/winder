-- ============================================================
--  WINDER — Tabla user_likes
--  Corre esto en Supabase SQL Editor
-- ============================================================

-- Tabla de likes (usuario → perfil demo)
CREATE TABLE IF NOT EXISTS user_likes (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id TEXT        NOT NULL,
  liked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, profile_id)
);

-- Row Level Security: cada usuario solo ve y modifica sus propios likes
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own likes" ON user_likes;
CREATE POLICY "users manage own likes"
  ON user_likes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime: necesario para que useMatches se actualice al instante
ALTER PUBLICATION supabase_realtime ADD TABLE user_likes;

-- ============================================================
--  Tabla users (perfil público, se crea al registrarse)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read users" ON users;
CREATE POLICY "public read users"
  ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "users manage own profile" ON users;
CREATE POLICY "users manage own profile"
  ON users FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

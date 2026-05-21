-- ============================================================
--  WINDER — Tabla fashion_profiles + Storage bucket
--  Corre esto en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de perfiles de moda (uno por usuario)
CREATE TABLE IF NOT EXISTS fashion_profiles (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  age         INT         NOT NULL CHECK (age BETWEEN 18 AND 99),
  city        TEXT        NOT NULL,
  style       TEXT        NOT NULL,
  bio         TEXT        NOT NULL,
  signature   TEXT        NOT NULL DEFAULT '',
  photo_url   TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  brands      TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Row Level Security
ALTER TABLE fashion_profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer perfiles (feed público)
DROP POLICY IF EXISTS "public read fashion_profiles" ON fashion_profiles;
CREATE POLICY "public read fashion_profiles"
  ON fashion_profiles FOR SELECT USING (true);

-- Solo el dueño puede crear/editar/borrar su perfil
DROP POLICY IF EXISTS "owner manage fashion_profile" ON fashion_profiles;
CREATE POLICY "owner manage fashion_profile"
  ON fashion_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime para que el feed se actualice en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE fashion_profiles;

-- ============================================================
-- 2. Storage bucket para fotos de perfil
--    (Ejecuta esto también en SQL Editor)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquiera puede ver las fotos (bucket público)
DROP POLICY IF EXISTS "public read profile-photos" ON storage.objects;
CREATE POLICY "public read profile-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Política: usuario autenticado puede subir/actualizar su propia foto
DROP POLICY IF EXISTS "owner upload profile-photos" ON storage.objects;
CREATE POLICY "owner upload profile-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "owner update profile-photos" ON storage.objects;
CREATE POLICY "owner update profile-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

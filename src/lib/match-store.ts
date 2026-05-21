/**
 * match-store — versión Supabase simplificada
 *
 * Los perfiles demo no tienen usuarios reales, así que guardamos
 * el profile_id directamente en una tabla propia `user_likes`.
 *
 * Esquema necesario (corre en Supabase SQL Editor):
 *
 *   CREATE TABLE IF NOT EXISTS user_likes (
 *     id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     profile_id TEXT        NOT NULL,
 *     liked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     UNIQUE (user_id, profile_id)
 *   );
 *   ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "users manage own likes"
 *     ON user_likes FOR ALL USING (auth.uid() = user_id);
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { profiles, type Profile } from "./profiles";

/** Agrega un like al perfil. Fire-and-forget desde la UI. */
export async function addMatch(profileId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // no autenticado, ignora

  await supabase
    .from("user_likes")
    .upsert(
      { user_id: session.user.id, profile_id: profileId },
      { onConflict: "user_id,profile_id" }
    );
}

/** Elimina todos los likes del usuario actual. */
export async function clearMatches() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("user_likes").delete().eq("user_id", session.user.id);
}

/** Hook: devuelve los Profile[] a los que el usuario dio like. */
export function useMatches(): Profile[] {
  const [matchedProfiles, setMatchedProfiles] = useState<Profile[]>([]);

  const fetchMatches = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setMatchedProfiles([]); return; }

    const { data: rows, error } = await supabase
      .from("user_likes")
      .select("profile_id")
      .eq("user_id", session.user.id)
      .order("liked_at", { ascending: false });

    if (error || !rows) { setMatchedProfiles([]); return; }

    const likedIds = rows.map((r) => r.profile_id as string);
    const matched = likedIds
      .map((id) => profiles.find((p) => p.id === id))
      .filter((p): p is Profile => Boolean(p));

    setMatchedProfiles(matched);
  }, []);

  useEffect(() => {
    fetchMatches();

    // Escucha realtime para actualizar al instante
    const channel = supabase
      .channel("user_likes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_likes" },
        () => fetchMatches()
      )
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchMatches());

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [fetchMatches]);

  return matchedProfiles;
}

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
import { demoProfiles, type Profile } from "./profiles";
import type { FashionProfileRow } from "./user-profile";

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

    // 1. Obtener todos los profile_ids likeados por el usuario
    const { data: rows, error } = await supabase
      .from("user_likes")
      .select("profile_id")
      .eq("user_id", session.user.id)
      .order("liked_at", { ascending: false });

    if (error || !rows) { setMatchedProfiles([]); return; }

    const likedIds = rows.map((r) => r.profile_id as string);
    if (likedIds.length === 0) { setMatchedProfiles([]); return; }

    // 2. Separar IDs demo vs IDs reales (UUIDs de fashion_profiles)
    const demoIds = likedIds.filter((id) => id.startsWith("demo-"));
    const realIds = likedIds.filter((id) => !id.startsWith("demo-"));

    // 3. Resolver perfiles demo desde el array local
    const demoMatches = demoIds
      .map((id) => demoProfiles.find((p) => p.id === id))
      .filter((p): p is Profile => Boolean(p));

    // 4. Resolver perfiles reales desde fashion_profiles en Supabase
    let realMatches: Profile[] = [];
    if (realIds.length > 0) {
      const { data: realRows } = await supabase
        .from("fashion_profiles")
        .select("*")
        .in("id", realIds);

      if (realRows) {
        // Conservar el orden original (por liked_at)
        const rowMap = new Map(
          (realRows as FashionProfileRow[]).map((r) => [r.id, r])
        );
        realMatches = realIds
          .map((id) => {
            const row = rowMap.get(id);
            if (!row) return null;
            return {
              id: row.id,
              userId: row.user_id,
              name: row.name,
              age: row.age,
              city: row.city,
              photo: row.photo_url
                ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
              style: row.style,
              bio: row.bio,
              tags: row.tags ?? [],
              brands: row.brands ?? [],
              signature: row.signature,
              isDemo: false,
            } as Profile;
          })
          .filter((p): p is Profile => Boolean(p));
      }
    }

    // 5. Combinar respetando el orden por liked_at
    const ordered = likedIds
      .map((id) =>
        [...demoMatches, ...realMatches].find((p) => p.id === id)
      )
      .filter((p): p is Profile => Boolean(p));

    setMatchedProfiles(ordered);
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
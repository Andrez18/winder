import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { demoProfiles, type Profile } from "./profiles";
import type { FashionProfileRow } from "./user-profile";

export async function addMatch(profileId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; 

  await supabase
    .from("user_likes")
    .upsert(
      { user_id: session.user.id, profile_id: profileId },
      { onConflict: "user_id,profile_id" }
    );
}

export async function clearMatches() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("user_likes").delete().eq("user_id", session.user.id);
}

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
    if (likedIds.length === 0) { setMatchedProfiles([]); return; }

    const demoIds = likedIds.filter((id) => id.startsWith("demo-"));
    const realIds = likedIds.filter((id) => !id.startsWith("demo-"));

    const demoMatches = demoIds
      .map((id) => demoProfiles.find((p) => p.id === id))
      .filter((p): p is Profile => Boolean(p));

    let realMatches: Profile[] = [];
    if (realIds.length > 0) {
      const { data: realRows } = await supabase
        .from("fashion_profiles")
        .select("*")
        .in("id", realIds);

      if (realRows) {
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

    const ordered = likedIds
      .map((id) =>
        [...demoMatches, ...realMatches].find((p) => p.id === id)
      )
      .filter((p): p is Profile => Boolean(p));

    setMatchedProfiles(ordered);
  }, []);

  useEffect(() => {
    fetchMatches();

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
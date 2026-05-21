/**
 * user-profile — CRUD del perfil de moda del usuario actual en Supabase
 *
 * Tabla: fashion_profiles
 *   id          UUID PK
 *   user_id     UUID FK auth.users (UNIQUE)
 *   name        TEXT
 *   age         INT
 *   city        TEXT
 *   style       TEXT
 *   bio         TEXT
 *   signature   TEXT
 *   photo_url   TEXT
 *   tags        TEXT[]
 *   brands      TEXT[]   (guardado como array de texto separado por coma)
 *   created_at  TIMESTAMPTZ
 *   updated_at  TIMESTAMPTZ
 */
import { supabase } from "./supabase";
import type { Profile } from "./profiles";

export type FashionProfileRow = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  city: string;
  style: string;
  bio: string;
  signature: string;
  photo_url: string | null;
  tags: string[];
  brands: string[];
  created_at: string;
  updated_at: string;
};

function rowToProfile(row: FashionProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    age: row.age,
    city: row.city,
    photo: row.photo_url ?? `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(row.name)}`,
    style: row.style,
    bio: row.bio,
    tags: row.tags ?? [],
    brands: row.brands ?? [],
    signature: row.signature,
    isDemo: false,
  };
}

/** Obtiene el perfil del usuario actual, o null si no ha creado uno todavía. */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("fashion_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) return null;
  return rowToProfile(data as FashionProfileRow);
}

/** Crea o actualiza el perfil del usuario actual. */
export async function saveMyProfile(payload: {
  name: string;
  age: number;
  city: string;
  style: string;
  bio: string;
  signature: string;
  photo_url?: string;
  tags: string[];
  brands: string[];
}): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("fashion_profiles")
    .upsert(
      { ...payload, user_id: session.user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToProfile(data as FashionProfileRow);
}

/** Sube una foto a Supabase Storage y devuelve la URL pública. */
export async function uploadProfilePhoto(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${session.user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(path);

  // Añade un timestamp para evitar cache del navegador
  return `${urlData.publicUrl}?t=${Date.now()}`;
}

/** Obtiene todos los perfiles reales (excepto el propio) para el feed. */
export async function getRealProfiles(myUserId?: string): Promise<Profile[]> {
  let query = supabase.from("fashion_profiles").select("*").order("created_at", { ascending: false });
  if (myUserId) query = query.neq("user_id", myUserId);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as FashionProfileRow[]).map(rowToProfile);
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Check, Loader2, Plus, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth-context";
import { getMyProfile, saveMyProfile, uploadProfilePhoto } from "@/lib/user-profile";
import { STYLE_OPTIONS, TAG_OPTIONS } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Mi perfil — Fitmatch" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [existing, setExisting] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("");
  const [bio, setBio] = useState("");
  const [signature, setSignature] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState("");
  const [brands, setBrands] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate({ to: "/login" }); return; }
    getMyProfile().then((p) => {
      if (p) {
        setExisting(p);
        setName(p.name);
        setAge(String(p.age));
        setCity(p.city);
        setStyle(p.style);
        setBio(p.bio);
        setSignature(p.signature);
        setPhotoUrl(p.photo);
        setTags(p.tags);
        setBrands(p.brands);
      } else {
        // Pre-fill name from auth
        setName(user?.name ?? "");
      }
      setLoading(false);
    });
  }, [isAuthenticated, user]);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const url = await uploadProfilePhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo foto");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 6 ? [...prev, tag] : prev
    );
  }

  function addBrand() {
    const b = brandInput.trim();
    if (b && !brands.includes(b) && brands.length < 5) {
      setBrands((prev) => [...prev, b]);
      setBrandInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !age || !city || !style || !bio) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await saveMyProfile({
        name,
        age: Number(age),
        city,
        style,
        bio,
        signature,
        photo_url: photoUrl || undefined,
        tags,
        brands,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setExisting(await getMyProfile());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando perfil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper paper-grain">
        <AppHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const avatar = photoUrl ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name || "?")}`;

  return (
    <div className="min-h-screen bg-paper paper-grain">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/discover" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-paper-soft">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {existing ? "Editar perfil" : "Crear perfil"}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Tu estilo, tu identidad
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {/* ── Foto ── */}
          <section className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-3xl border-2 border-border bg-card">
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-ink text-paper shadow-md transition hover:opacity-80 disabled:opacity-50"
              >
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadingPhoto ? "Subiendo foto…" : "Toca el ícono para subir tu foto"}
            </p>
          </section>

          {/* ── Datos básicos ── */}
          <section className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nombre *" value={name} onChange={setName} placeholder="Como quieres que te vean" />
            </div>
            <Field label="Edad *" value={age} onChange={setAge} placeholder="25" type="number" min="18" max="99" />
            <Field label="Ciudad *" value={city} onChange={setCity} placeholder="Medellín" />
          </section>

          {/* ── Estilo ── */}
          <section>
            <Label>Estilo principal *</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    style === s
                      ? "bg-ink text-paper"
                      : "border border-border bg-card text-muted-foreground hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* ── Bio y firma ── */}
          <section className="space-y-4">
            <div>
              <Label>Bio *</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cómo describes tu estilo en una frase…"
                rows={3}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ink focus:ring-2 focus:ring-ink/10 resize-none"
              />
            </div>
            <Field
              label="Firma de estilo"
              value={signature}
              onChange={setSignature}
              placeholder="Ej: Capas y siluetas amplias"
            />
          </section>

          {/* ── Tags ── */}
          <section>
            <Label>Tags de estilo <span className="text-muted-foreground font-normal">(máx. 6)</span></Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((t) => {
                const sel = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                      sel
                        ? "bg-ink text-paper"
                        : "border border-border bg-card text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Marcas ── */}
          <section>
            <Label>Marcas favoritas <span className="text-muted-foreground font-normal">(máx. 5)</span></Label>
            <div className="mt-3 flex gap-2">
              <input
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBrand(); } }}
                placeholder="Ej: COS, Acne Studios…"
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              <button
                type="button"
                onClick={addBrand}
                disabled={brands.length >= 5}
                className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-paper disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {brands.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {brands.map((b) => (
                  <span key={b} className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs">
                    {b}
                    <button type="button" onClick={() => setBrands((prev) => prev.filter((x) => x !== b))}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-ink" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Error / Submit ── */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || uploadingPhoto}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
            ) : saved ? (
              <><Check className="h-4 w-4" /> ¡Guardado!</>
            ) : (
              existing ? "Guardar cambios" : "Crear mi perfil"
            )}
          </button>

          {existing && (
            <p className="text-center text-xs text-muted-foreground">
              Tu perfil ya aparece en el feed de otros usuarios.{" "}
              <Link to="/discover" className="underline underline-offset-4 hover:text-ink">Ir a descubrir →</Link>
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{children}</p>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", min, max,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; min?: string; max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type} value={value} min={min} max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ink focus:ring-2 focus:ring-ink/10"
      />
    </label>
  );
}

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/discover",
  }),
  head: () => ({
    meta: [
      { title: "Inicia sesión — Fitmatch" },
      { name: "description", content: "Accede a tu cuenta de Fitmatch." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const { redirect } = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: redirect });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="login" error={error} loading={loading} onSubmit={onSubmit}>
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" autoComplete="email" />
      <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
    </AuthShell>
  );
}

/* ── Shared shell ─────────────────────────────────────────────────────────── */

type ShellProps = {
  mode: "login" | "register";
  error: string | null;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
};

export function AuthShell({ mode, error, loading, onSubmit, children }: ShellProps) {
  const isLogin = mode === "login";
  return (
    <div className="min-h-screen bg-paper paper-grain">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <aside className="hidden flex-col justify-between rounded-3xl bg-ink p-10 text-paper lg:flex lg:my-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-paper text-ink">
              <Flame className="h-4 w-4" />
            </div>
            <p className="font-display text-lg font-semibold">Fitmatch</p>
          </Link>
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight">
              Tu armario,
              <br />
              <span className="italic font-normal opacity-70">tu gente.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm opacity-70">
              Únete a la comunidad que empareja por estilo, no por filtros.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Paper / Ink Edition</p>
        </aside>

        <main className="flex flex-col justify-center py-10 lg:py-16">
          <div className="mx-auto w-full max-w-sm">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-paper">
                <Flame className="h-3.5 w-3.5" />
              </div>
              <span className="font-display text-base font-semibold">Fitmatch</span>
            </Link>

            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
              {isLogin ? "Inicia sesión" : "Únete a Fitmatch"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Accede para seguir descubriendo estilos."
                : "Empieza a deslizar y conecta por tu estética."}
            </p>

            {/* ⚠️  No usar <form> con método GET; el default POST evita exponer creds en la URL */}
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {children}

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Procesando…" : isLogin ? "Entrar" : "Crear cuenta"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  ¿Aún no tienes cuenta?{" "}
                  <Link to="/register" className="font-medium text-ink underline-offset-4 hover:underline">
                    Regístrate
                  </Link>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
                    Inicia sesión
                  </Link>
                </>
              )}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ink focus:ring-2 focus:ring-ink/10"
      />
    </label>
  );
}

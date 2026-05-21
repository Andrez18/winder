import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Flame, Heart, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: "/", label: "Inicio" },
    { to: "/discover", label: "Descubrir" },
    { to: "/matches", label: "Matches" },
  ] as const;

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-paper">
            <Flame className="h-4 w-4" />
          </div>
          <div className="hidden leading-none sm:block">
            <p className="font-display text-lg font-semibold tracking-tight">Fitmatch</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">estilo / personas</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
          {items.map((i) => {
            const active = pathname === i.to;
            return (
              <Link
                key={i.to}
                to={i.to}
                className={"rounded-full px-3 py-1.5 transition-colors sm:px-4 " + (active ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink")}
              >
                {i.label === "Matches" ? (
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5" /> {i.label}
                  </span>
                ) : i.label}
              </Link>
            );
          })}
        </nav>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {/* Avatar → lleva al perfil */}
            <Link
              to="/profile"
              title="Mi perfil"
              className={
                "grid h-9 w-9 place-items-center rounded-full text-xs font-medium transition-opacity hover:opacity-80 " +
                (pathname === "/profile" ? "ring-2 ring-ink ring-offset-1" : "") +
                " bg-ink text-paper"
              }
            >
              {(user?.name ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
            </Link>

            <Link
              to="/profile"
              className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-ink sm:inline-flex"
            >
              <UserCircle className="h-3.5 w-3.5" /> Mi perfil
            </Link>

            {/* Móvil: solo ícono */}
            <button
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-ink sm:hidden"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Desktop: ícono + texto */}
            <button
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-ink sm:inline-flex"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-ink sm:inline-flex">
              Entrar
            </Link>
            <Link to="/register" className="inline-flex rounded-full bg-ink px-4 py-1.5 text-sm text-paper hover:opacity-90">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
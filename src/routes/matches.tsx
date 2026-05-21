import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { clearMatches, useMatches } from "@/lib/match-store";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Tus matches — Fitmatch" },
      {
        name: "description",
        content: "Las personas que comparten tu estilo. Conecta y empieza la conversación.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { isAuthenticated } = useAuth();
  const matches = useMatches();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper paper-grain">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="font-display text-2xl font-semibold">Inicia sesión para ver tus matches</h2>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper"
            >
              Entrar
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper paper-grain">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              tu armario social
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Tus matches
            </h1>
          </div>
          {matches.length > 0 && (
            <button
              onClick={() => clearMatches()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-ink"
            >
              <Trash2 className="h-3 w-3" /> Vaciar
            </button>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper-soft">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Aún no hay matches</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Empieza a deslizar para encontrar gente con tu mismo lenguaje estético.
            </p>
            <Link
              to="/discover"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper"
            >
              Descubrir personas
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-12 gap-3 sm:gap-4">
            {matches.map((p, i) => {
              const variants = [
                "col-span-12 sm:col-span-8 row-span-2",
                "col-span-6 sm:col-span-4",
                "col-span-6 sm:col-span-4",
                "col-span-12 sm:col-span-6",
                "col-span-6 sm:col-span-3",
                "col-span-6 sm:col-span-3",
              ];
              const span = variants[i % variants.length];
              return (
                <article
                  key={p.id}
                  className={`group relative overflow-hidden rounded-3xl bg-card shadow-paper ${span}`}
                >
                  <img
                    src={p.photo}
                    alt={p.name}
                    width={768}
                    height={1024}
                    loading="lazy"
                    className="aspect-[3/4] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <h3 className="font-display text-2xl font-semibold leading-none">{p.name}</h3>
                        <p className="mt-1 text-xs opacity-80">
                          {p.city} · {p.style}
                        </p>
                      </div>
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink">
                        <Heart className="h-4 w-4 fill-ink" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

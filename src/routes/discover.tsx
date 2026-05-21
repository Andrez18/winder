import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Heart, RotateCcw, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SwipeCard } from "@/components/SwipeCard";
import { demoProfiles } from "@/lib/profiles";
import type { Profile } from "@/lib/profiles";
import { addMatch } from "@/lib/match-store";
import { getRealProfiles } from "@/lib/user-profile";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Descubrir — Fitmatch" },
      { name: "description", content: "Desliza perfiles y descubre personas que comparten tu estilo." },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { user } = useAuth();
  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<"like" | "nope" | null>(null);

  // Carga perfiles reales (excepto el propio) al montar
  useEffect(() => {
    getRealProfiles(user?.id).then(setRealProfiles);
  }, [user?.id]);

  // Perfiles reales primero, luego los demo
  const allProfiles = useMemo(
    () => [...realProfiles, ...demoProfiles],
    [realProfiles]
  );

  const current = allProfiles[index];
  const visible = useMemo(() => allProfiles.slice(index, index + 3), [allProfiles, index]);

  function swipe(dir: "like" | "nope") {
    if (!current) return;
    if (dir === "like") addMatch(current.id);
    setLastAction(dir);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setLastAction(null);
  }

  return (
    <div className="min-h-screen bg-paper paper-grain">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* Card stack */}
          <div className="col-span-12 lg:col-span-7">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
              <AnimatePresence>
                {visible.length > 0 ? (
                  visible
                    .slice()
                    .reverse()
                    .map((p, i) => {
                      const stackIndex = visible.length - 1 - i;
                      return (
                        <SwipeCard
                          key={p.id}
                          profile={p}
                          active={stackIndex === 0}
                          stackIndex={stackIndex}
                          onSwipe={swipe}
                        />
                      );
                    })
                ) : (
                  <EmptyState onRestart={restart} />
                )}
              </AnimatePresence>
            </div>

            {visible.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <ActionButton onClick={() => swipe("nope")} aria-label="Nope">
                  <X className="h-6 w-6 text-nope" />
                </ActionButton>
                <ActionButton onClick={restart} aria-label="Reiniciar" small>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </ActionButton>
                <ActionButton onClick={() => swipe("like")} aria-label="Match" primary>
                  <Heart className="h-6 w-6 fill-paper text-paper" />
                </ActionButton>
              </div>
            )}
          </div>

          {/* Bento side panel */}
          <aside className="col-span-12 lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Panel
                className="col-span-2"
                label="estilo actual"
                value={current?.style ?? "—"}
                hint={current ? `${current.name}, ${current.age} · ${current.city}` : "Sin más perfiles"}
              />
              <Panel label="signature" value={current?.signature ?? "—"} small />
              <Panel label="bio" value={current?.bio ?? "—"} small />
              <div className="col-span-2 rounded-3xl border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Marcas favoritas</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(current?.brands ?? []).map((b) => (
                    <span key={b} className="rounded-full border border-border bg-paper px-3 py-1 text-xs font-medium">{b}</span>
                  ))}
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Tags</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(current?.tags ?? []).map((t) => (
                    <span key={t} className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper">{t}</span>
                  ))}
                </div>
              </div>

              <motion.div
                key={lastAction + String(index)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-2 flex items-center justify-between rounded-3xl border border-border bg-paper-soft p-5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-muted-foreground">Tu último gesto:</span>
                  <strong className="font-display tracking-tight">
                    {lastAction === "like" ? "Match ✓" : lastAction === "nope" ? "Nope" : "—"}
                  </strong>
                </div>
                <Link to="/matches" className="text-xs font-medium underline-offset-4 hover:underline">
                  Ver matches →
                </Link>
              </motion.div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground lg:text-left">
              Desliza la tarjeta → para hacer match · ← para descartar
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ActionButton({
  children, primary, small, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; small?: boolean }) {
  const size = small ? "h-12 w-12" : "h-16 w-16";
  const style = primary ? "bg-ink text-paper border-ink" : "bg-card border-border";
  return (
    <button {...rest} className={`${size} grid place-items-center rounded-full border shadow-paper transition-transform hover:scale-105 active:scale-95 ${style}`}>
      {children}
    </button>
  );
}

function Panel({ label, value, hint, small, className = "" }: {
  label: string; value: string; hint?: string; small?: boolean; className?: string;
}) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-5 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className={"mt-2 font-display font-semibold leading-tight " + (small ? "text-base" : "text-2xl sm:text-3xl")}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function EmptyState({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
      <Sparkles className="h-8 w-8" />
      <h3 className="mt-4 font-display text-2xl font-semibold">Fin del rack</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Revisaste a todo el mundo. Recarga la pasarela para volver a empezar.
      </p>
      <button onClick={onRestart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
        <RotateCcw className="h-4 w-4" /> Reiniciar
      </button>
    </div>
  );
}

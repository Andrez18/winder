import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Shirt, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import heroImg from "@/assets/profile-1.jpg";
import heroImg2 from "@/assets/profile-5.jpg";
import heroImg3 from "@/assets/profile-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fitmatch — Conecta por tu estilo" },
      {
        name: "description",
        content:
          "Fitmatch es la app de citas para amantes de la moda. Desliza, conecta y descubre personas por su estilo.",
      },
      { property: "og:title", content: "Fitmatch — Conecta por tu estilo" },
      {
        property: "og:description",
        content:
          "Desliza, conecta y descubre personas por su forma de vestir.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-paper paper-grain">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-14">
        {/* Bento Hero Grid */}
        <section className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* Headline */}
          <div className="col-span-12 flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-10 lg:col-span-8 lg:row-span-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Beta — Edición Otoño
              </p>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-[88px]">
                Conecta con quien
                <br />
                <span className="italic font-normal opacity-70">viste tu mundo.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
                Fitmatch empareja personas por su estilo: streetwear, minimal, vintage,
                quiet luxury. Desliza, encuentra tu match estético y conoce a alguien que
                entiende tu armario.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/discover"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.02]"
              >
                Empezar a deslizar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/matches"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-paper px-6 py-3.5 text-sm font-medium text-ink hover:bg-paper-soft"
              >
                Ver mis matches
              </Link>
            </div>
          </div>

          {/* Photo tile 1 */}
          <div className="col-span-7 aspect-[3/4] overflow-hidden rounded-3xl bg-card lg:col-span-4 lg:aspect-auto">
            <img
              src={heroImg}
              alt="Estilo streetwear"
              width={768}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Stat card */}
          <div className="col-span-5 rounded-3xl border border-border bg-ink p-5 text-paper lg:col-span-2">
            <p className="font-display text-4xl font-semibold sm:text-5xl">12k</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] opacity-70">
              estilistas en la app
            </p>
          </div>

          {/* Photo tile 2 */}
          <div className="col-span-7 aspect-square overflow-hidden rounded-3xl bg-card lg:col-span-2">
            <img
              src={heroImg2}
              alt="Estilo minimal"
              width={768}
              height={1024}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        {/* How it works — bento */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tres pasos. Cero filtros aburridos.
            </h2>
            <p className="hidden text-sm text-muted-foreground sm:block">/ cómo funciona</p>
          </div>

          <div className="mt-8 grid grid-cols-12 gap-3 sm:gap-4">
            <Feature
              n="01"
              title="Define tu estilo"
              body="Elige tus marcas, siluetas y referencias. Tu perfil se construye con tu armario, no con clichés."
              icon={<Shirt className="h-5 w-5" />}
              span="col-span-12 sm:col-span-6 lg:col-span-5"
            />
            <Feature
              n="02"
              title="Desliza con intención"
              body="Cada tarjeta muestra el lenguaje estético de una persona — marcas, capas, signature look."
              icon={<X className="h-5 w-5" />}
              span="col-span-12 sm:col-span-6 lg:col-span-4"
            />
            <Feature
              n="03"
              title="Conecta de verdad"
              body="Match cuando dos estilos se entienden. Habla de ropa, de música, de la vida."
              icon={<Heart className="h-5 w-5" />}
              span="col-span-12 lg:col-span-3"
              dark
            />

            <div className="col-span-12 overflow-hidden rounded-3xl lg:col-span-7">
              <img
                src={heroImg3}
                alt="Estilo Y2K"
                width={768}
                height={1024}
                loading="lazy"
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
            <div className="col-span-12 flex flex-col justify-between rounded-3xl border border-border bg-paper-soft p-6 lg:col-span-5">
              <p className="font-display text-2xl leading-tight sm:text-3xl">
                “Por fin una app donde mi obsesión por las marcas no es un red flag.”
              </p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">— Mara, 26</p>
                  <p className="text-xs text-muted-foreground">CDMX / Streetwear</p>
                </div>
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper"
                >
                  Probar <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Fitmatch — hecho con buena tela.</p>
          <p className="font-display tracking-wide">Paper / Ink Edition</p>
        </footer>
      </main>
    </div>
  );
}

function Feature({
  n,
  title,
  body,
  icon,
  span,
  dark,
}: {
  n: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  span: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col justify-between rounded-3xl border p-6 " +
        span +
        " " +
        (dark
          ? "border-ink bg-ink text-paper"
          : "border-border bg-card text-ink")
      }
    >
      <div className="flex items-start justify-between">
        <span
          className={
            "text-xs font-medium tracking-[0.25em] " +
            (dark ? "text-paper/60" : "text-muted-foreground")
          }
        >
          {n}
        </span>
        <span
          className={
            "grid h-9 w-9 place-items-center rounded-xl " +
            (dark ? "bg-paper text-ink" : "bg-ink text-paper")
          }
        >
          {icon}
        </span>
      </div>
      <div className="mt-10">
        <h3 className="font-display text-xl font-semibold sm:text-2xl">{title}</h3>
        <p
          className={
            "mt-2 text-sm " + (dark ? "text-paper/70" : "text-muted-foreground")
          }
        >
          {body}
        </p>
      </div>
    </div>
  );
}

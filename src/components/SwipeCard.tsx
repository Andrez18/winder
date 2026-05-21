import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { MapPin, Sparkles } from "lucide-react";
import type { Profile } from "@/lib/profiles";

type Props = {
  profile: Profile;
  active: boolean;
  onSwipe: (dir: "like" | "nope") => void;
  stackIndex: number;
};

export function SwipeCard({ profile, active, onSwipe, stackIndex }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 120) onSwipe("like");
    else if (info.offset.x < -120) onSwipe("nope");
  }

  const offsetScale = 1 - stackIndex * 0.04;
  const offsetY = stackIndex * 14;

  return (
    <motion.article
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{
        x: active ? x : 0,
        rotate: active ? rotate : 0,
        zIndex: 10 - stackIndex,
      }}
      initial={{ scale: offsetScale, y: offsetY, opacity: 0 }}
      animate={{ scale: offsetScale, y: offsetY, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 600 : -600, opacity: 0, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-0 select-none overflow-hidden rounded-3xl bg-card shadow-card cursor-grab active:cursor-grabbing"
    >
      <img
        src={profile.photo}
        alt={`${profile.name} — ${profile.style}`}
        width={768}
        height={1024}
        draggable={false}
        loading={stackIndex === 0 ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

      {/* Stamps */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute left-6 top-6 rotate-[-12deg] border-4 border-like px-4 py-1 text-2xl font-display font-bold uppercase tracking-widest text-like"
      >
        Match
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute right-6 top-6 rotate-[12deg] border-4 border-nope px-4 py-1 text-2xl font-display font-bold uppercase tracking-widest text-nope"
      >
        Nope
      </motion.div>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-none">
              {profile.name}, <span className="opacity-80">{profile.age}</span>
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm opacity-80">
              <MapPin className="h-3.5 w-3.5" /> {profile.city}
            </p>
          </div>
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium uppercase tracking-wider text-ink">
            {profile.style}
          </span>
        </div>
        <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">{profile.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-paper/30 bg-ink/30 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] opacity-70">
          <Sparkles className="h-3 w-3" /> {profile.signature}
        </p>
      </div>
    </motion.article>
  );
}

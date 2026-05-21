import p1 from "@/assets/profile-1.jpg";
import p2 from "@/assets/profile-2.jpg";
import p3 from "@/assets/profile-3.jpg";
import p4 from "@/assets/profile-4.jpg";
import p5 from "@/assets/profile-5.jpg";
import p6 from "@/assets/profile-6.jpg";

export type Profile = {
  id: string;
  userId?: string;       // UUID del usuario en auth.users (solo perfiles reales)
  name: string;
  age: number;
  city: string;
  photo: string;         // URL o import local
  style: string;
  bio: string;
  tags: string[];
  brands: string[];
  signature: string;
  isDemo?: boolean;      // true = perfil semilla, false/undefined = usuario real
};

// Perfiles demo incluidos siempre en el feed
export const demoProfiles: Profile[] = [
  {
    id: "demo-1", name: "Mara", age: 26, city: "CDMX", photo: p1,
    style: "Streetwear", bio: "Cazadora oversize, sneakers raros y siempre un layer de más.",
    tags: ["Oversize", "Vintage", "Workwear", "Sneakerhead"],
    brands: ["Carhartt", "Acne", "Stüssy"], signature: "Capas y siluetas amplias", isDemo: true,
  },
  {
    id: "demo-2", name: "Andrés", age: 29, city: "Madrid", photo: p2,
    style: "Minimal Tailoring", bio: "Paleta neutra, sastrería suave y zapato pulido.",
    tags: ["Minimal", "Tailoring", "Beige", "Slow fashion"],
    brands: ["COS", "Lemaire", "Uniqlo U"], signature: "Líneas limpias, tela natural", isDemo: true,
  },
  {
    id: "demo-3", name: "Ivy", age: 24, city: "Berlín", photo: p3,
    style: "Grunge 90s", bio: "Cuero, cuadros y un poco de caos. Música más alta que el outfit.",
    tags: ["Grunge", "Vintage", "Leather", "Plaid"],
    brands: ["Diesel", "Dr. Martens", "Vintage Levi's"], signature: "Cuero + falda escocesa", isDemo: true,
  },
  {
    id: "demo-4", name: "Tomi", age: 22, city: "Buenos Aires", photo: p4,
    style: "Y2K Streetwear", bio: "Baggy, color y nostalgia 2002. Tech sneakers obligatorios.",
    tags: ["Y2K", "Color", "Baggy", "Graphic tees"],
    brands: ["Diesel", "Ed Hardy", "Adidas"], signature: "Color saturado + denim ancho", isDemo: true,
  },
  {
    id: "demo-5", name: "Noa", age: 28, city: "París", photo: p5,
    style: "Quiet Luxury", bio: "Negro, corte preciso, labial rojo. Lo demás sobra.",
    tags: ["Minimal", "Monocromo", "Tailoring", "Elegante"],
    brands: ["The Row", "Toteme", "Jil Sander"], signature: "Negro absoluto", isDemo: true,
  },
  {
    id: "demo-6", name: "Joaquín", age: 34, city: "Oaxaca", photo: p6,
    style: "Boho Artisanal", bio: "Lino, lana cruda y piezas hechas a mano. Hilo > algoritmo.",
    tags: ["Boho", "Artesanal", "Linen", "Earth tones"],
    brands: ["Story Mfg", "Kapital", "Local artisans"], signature: "Texturas naturales en capas", isDemo: true,
  },
];

// Alias para compatibilidad con código existente
export const profiles = demoProfiles;

export const STYLE_OPTIONS = [
  "Streetwear", "Minimal Tailoring", "Grunge 90s", "Y2K Streetwear",
  "Quiet Luxury", "Boho Artisanal", "Preppy", "Cottagecore",
  "Dark Academia", "Gorpcore", "Workwear", "Old Money", "Otro",
];

export const TAG_OPTIONS = [
  "Oversize", "Vintage", "Workwear", "Sneakerhead", "Minimal", "Tailoring",
  "Beige", "Slow fashion", "Grunge", "Leather", "Plaid", "Y2K", "Color",
  "Baggy", "Graphic tees", "Monocromo", "Elegante", "Boho", "Artesanal",
  "Linen", "Earth tones", "Preppy", "Cottagecore", "Dark Academia",
];

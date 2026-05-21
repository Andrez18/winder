import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Fitmatch" },
      { name: "description", content: "Crea tu cuenta en Fitmatch y empieza a hacer match por estilo." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      // Con "Confirm email" OFF la sesión ya está activa → redirige directo
      navigate({ to: "/discover" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell mode="register" error={error} loading={loading} onSubmit={onSubmit}>
      <Field label="Nombre" type="text" value={name} onChange={setName} placeholder="Cómo te llamas" autoComplete="name" />
      <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" autoComplete="email" />
      <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
    </AuthShell>
  );
}

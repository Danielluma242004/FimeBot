"use client";
import { useState } from "react";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      onSuccess();
    } else {
      setError(data.error || "Error de autenticación.");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4 text-emerald-900">Acceso Administrador</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 text-gray-500"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 text-gray-500"
          required
        />
        <button
          type="submit"
          className="bg-emerald-700 text-white rounded px-4 py-2 font-semibold hover:bg-emerald-800"
        >
          Ingresar
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
      <p className="text-xs text-gray-500 mt-4">
        ¿No tienes acceso? Solicítalo a <a href="mailto:Danielluma242004@hotmail.com" className="underline text-emerald-700">Danielluma242004@hotmail.com</a>
      </p>
    </div>
  );
}
"use client"
// pages/admin.tsx
import { useEffect, useState } from 'react';

interface Consulta {
  id: string;
  query: string;
  response: string;
  created_at: string;
  // Posibles campos futuros: category, updated_at, feedback, user_id, etc.
}

export default function AdminPanel() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchConsultas() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/consultas', {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setConsultas(data.consultas);
        } else {
          setError(data.error || 'Error al cargar datos');
        }
      } catch (err) {
        console.error('Error al obtener datos administrativos:', err);
        setError('Error al cargar datos');
      }
      setLoading(false);
    }
    fetchConsultas();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-4xl w-full flex flex-col">
        {/* Logo y Título */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-2 rounded-full flex items-center justify-center">
            <img src="/logo.gif" alt="FimeBot Logo" className="w-24 h-24" />
          </div>
          <h1 className="text-3xl font-bold cursor-default">Panel Administrativo - FimeBot</h1>
          <p className="mt-1 text-sm text-gray-300 cursor-default">
            Monitoreo de consultas académicas y administrativas.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-white text-red-600 rounded-lg shadow-lg p-4 mb-4">
            <p className="text-center font-semibold">{error}</p>
          </div>
        ) : (
          <div className="bg-white text-emerald-900 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-emerald-700 text-white">
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Consulta</th>
                    <th className="px-4 py-3 text-left">Respuesta</th>
                    {/* Futuras columnas: Category, Feedback, etc. */}
                  </tr>
                </thead>
                <tbody>
                  {consultas.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                        No hay consultas registradas
                      </td>
                    </tr>
                  ) : (
                    consultas.map((consulta) => (
                      <tr key={consulta.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(consulta.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs overflow-hidden text-ellipsis">
                            {consulta.query}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs overflow-hidden text-ellipsis">
                            {consulta.response}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {consultas.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total de consultas: {consultas.length}
                </span>
                <button className="bg-emerald-700 px-4 py-2 rounded-full text-white font-medium hover:bg-emerald-800 transition">
                  Exportar datos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client"
import { useState, useEffect } from 'react';
import type { ConsultaStats, CategoryStats } from '@/lib/types';

export default function ConsultaAnalytics() {
  const [stats, setStats] = useState<{
    frequentQueries: ConsultaStats[];
    categoryStats: CategoryStats[];
    totalQueries: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          setError(data.error || 'Error al cargar estadísticas');
        }
      } catch (err) {
        setError('Error al cargar estadísticas');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text">
      <h2 className="text-2xl font-bold mb-4 text-emerald-900">Análisis de Consultas</h2>
      
      {/* Consultas Frecuentes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">Top 10 Consultas Frecuentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-emerald-700">
                <th className="px-4 py-2 text-left">Consulta</th>
                <th className="px-4 py-2 text-left">Frecuencia</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Último uso</th>
              </tr>
            </thead>
            <tbody>
              {stats.frequentQueries.map((query, index) => (
                <tr key={index} className="border-b text-emerald-900 border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{query.query}</td>
                  <td className="px-4 py-2">{query.count}</td>
                  <td className="px-4 py-2">{query.category}</td>
                  <td className="px-4 py-2">
                    {new Date(query.lastUsed).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas por Categoría */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">Distribución por Categoría</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.categoryStats.map((cat, index) => (
            <div key={index} className="bg-emerald-700 p-4 rounded-lg">
              <h4 className="font-medium">{cat.category}</h4>
              <div className="flex justify-between mt-2">
                <span>{cat.totalQueries} consultas</span>
                <span>{cat.percentageOfTotal.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full"
                  style={{ width: `${cat.percentageOfTotal}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
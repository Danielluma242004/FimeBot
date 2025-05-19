"use client"
import { useState, useEffect } from 'react';
import { SystemMetrics, PerformanceData } from '@/lib/types';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<Partial<SystemMetrics> | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/metrics');
        if (!res.ok) {
          throw new Error('Error al cargar métricas');
        }
        const data = await res.json();
        setMetrics(data.metrics);
        setPerformanceData(data.performance);
        setError(null);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Error al cargar métricas del sistema');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-gray-500 text-center">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-emerald-900">Monitoreo del Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Tiempo de Respuesta"
          value={`${metrics?.responseTime?.toFixed(2) || 0}ms`}
          trend={metrics?.responseTime && metrics.responseTime < 200 ? "positive" : "negative"}
          description="Promedio últimos 5 minutos"
        />
        <MetricCard
          title="Consultas/Minuto"
          value={`${metrics?.requestsPerMinute?.toFixed(1) || 0}`}
          trend="neutral"
          description="Últimos 5 minutos"
        />
        <MetricCard
          title="Usuarios Activos"
          value={`${metrics?.activeUsers || 0}`}
          trend="neutral"
          description="Sesiones únicas activas"
        />
      </div>

      <p className="text-sm text-gray-500 text-right">
        Última actualización: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : '-'}
      </p>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: "positive" | "negative" | "neutral";
  description: string;
}

function MetricCard({ title, value, trend, description }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "positive": return "text-red-500";
      case "negative": return "text-green-500";
      default: return "text-emerald-600";
    }
  };

  return (
    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
      <h3 className="text-sm font-medium text-emerald-800 mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
      <p className="text-xs text-emerald-600 mt-1">{description}</p>
    </div>
  );
}
import { supabaseAdmin } from './supabaseAdmin';
import type { ConsultaStats, CategoryStats } from './types';

export async function getConsultaStats(): Promise<{
  frequentQueries: ConsultaStats[];
  categoryStats: CategoryStats[];
  totalQueries: number;
}> {
  const { data: consultas, error } = await supabaseAdmin
    .from('consultas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Analizar consultas frecuentes
  const queryMap = new Map<string, ConsultaStats>();
  const categoryCount = new Map<string, number>();
  const totalQueries = consultas.length;

  consultas.forEach(consulta => {
    // Normalizar la consulta para agrupar similares
    const normalizedQuery = consulta.query.toLowerCase().trim();
    const category = consulta.category || 'sin_categoria';
    
    // Actualizar estadísticas de consultas
    if (queryMap.has(normalizedQuery)) {
      const stats = queryMap.get(normalizedQuery)!;
      stats.count++;
      stats.averageResponseTime = (stats.averageResponseTime + consulta.responseTime) / 2;
      if (consulta.created_at > stats.lastUsed) {
        stats.lastUsed = consulta.created_at;
      }
    } else {
      queryMap.set(normalizedQuery, {
        query: consulta.query,
        count: 1,
        category,
        averageResponseTime: consulta.responseTime || 0,
        lastUsed: consulta.created_at
      });
    }

    // Actualizar conteo de categorías
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  });

  // Preparar estadísticas de categorías
  const categoryStats: CategoryStats[] = Array.from(categoryCount.entries())
    .map(([category, count]) => ({
      category,
      totalQueries: count,
      percentageOfTotal: (count / totalQueries) * 100
    }))
    .sort((a, b) => b.totalQueries - a.totalQueries);

  // Obtener las consultas más frecuentes
  const frequentQueries = Array.from(queryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    frequentQueries,
    categoryStats,
    totalQueries
  };
}
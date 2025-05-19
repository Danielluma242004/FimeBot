import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { SystemMetrics } from '@/lib/types';

export async function GET() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    // Obtener consultas recientes
    const { data: recentQueries, error } = await supabaseAdmin
      .from('consultas')
      .select('response_time, created_at, session_id')
      .gte('created_at', fiveMinutesAgo.toISOString());

    if (error) throw error;

    // Calcular métricas reales
    const responseTime = calculateAverageResponseTime(recentQueries || []);
    const requestCount = recentQueries?.length || 0;
    const requestsPerMinute = requestCount / 5; // Dividir por 5 minutos
    const activeUsers = await getActiveUsers();

    const metrics: Partial<SystemMetrics> = {
      responseTime,
      requestsPerMinute,
      activeUsers,
      lastUpdated: now.toISOString()
    };

    return NextResponse.json({
      metrics,
      performance: {
        hourly: {
          labels: getLastHourLabels(),
          responseTime: [responseTime],
          requests: [requestsPerMinute]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
}

function getLastHourLabels(): string[] {
  const now = new Date();
  return [now.toLocaleTimeString()];
}

function calculateAverageResponseTime(queries: any[]): number {
  if (queries.length === 0) return 0;
  const validQueries = queries.filter(q => q.response_time != null);
  if (validQueries.length === 0) return 0;
  return validQueries.reduce((sum, q) => sum + q.response_time, 0) / validQueries.length;
}

function calculateErrorRate(queries: any[]): number {
  if (queries.length === 0) return 0;
  const errors = queries.filter(q => q.status === 'error').length;
  return errors / queries.length;
}

async function getActiveUsers(): Promise<number> {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
  
  const { data } = await supabaseAdmin
    .from('consultas')
    .select('session_id')
    .gte('created_at', fiveMinutesAgo.toISOString());

  if (!data) return 0;
  
  // Contar sesiones únicas
  const uniqueSessions = new Set(data.map(q => q.session_id));
  return uniqueSessions.size;
}
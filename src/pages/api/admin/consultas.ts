// pages/api/admin/consultas.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar token de autorización (en producción usar autenticación adecuada)
  const token = req.headers.authorization;
  if (token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('consultas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener consultas:', error);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }
    return res.status(200).json({ consultas: data });
  } catch (error) {
    console.error('Error en API administrativo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { detectCategory, getCategoryResponse } from '../../lib/chatLogic';
import type { Document, Question, BotResponse } from '../../lib/types';

type ResponseData = {
  response?: string;
  category?: string;
  documents?: Document[];
  subjects?: Array<{
    title: string;
    questions: Question[];
  }>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'La consulta es requerida y debe ser un texto' });
  }

  try {
    const categorySlug = detectCategory(query);
    const categoryData = await getCategoryResponse(categorySlug, query);

    if (!categoryData) {
      return res.status(404).json({ 
        response: 'Lo siento, no encontré información relacionada con tu consulta.' 
      });
    }

    // Guardar la consulta en el historial
    await supabaseAdmin
      .from('consultas')
      .insert([{
        query,
        category: categorySlug,
        response: categoryData.response
      }]);

    return res.status(200).json({
      response: categoryData.response,
      category: categorySlug,
      documents: categoryData.documents,
      subjects: categoryData.subjects
    });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

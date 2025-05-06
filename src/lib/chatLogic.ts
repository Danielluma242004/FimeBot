// lib/chatLogic.ts
import { supabaseClient } from './supabaseClient';
import type { Category, BotResponse, Question } from './types';

// Exportar la función detectCategory
export function detectCategory(query: string): string {
  const keywords = {
    horarios: ['horario', 'calendario', 'clases', 'semestre', 'fecha'],
    'servicio social': ['servicio', 'social', 'pre-registro'],
    eventos: ['evento', 'conferencia', 'taller', 'avisos', 'importantes']
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => query.toLowerCase().includes(word))) {
      return category;
    }
  }

  // Si no encuentra categoría específica, devolver 'general' para búsqueda personalizada
  return 'general';
}

// Función mejorada para calcular similitud usando varios métodos
function calculateSimilarity(str1: string, str2: string): number {
  // Normalizar strings
  const normalize = (str: string) => str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,¿?¡!]/g, "")
    .trim();

  const s1 = normalize(str1);
  const s2 = normalize(str2);

  // 1. Similitud por palabras comunes
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);

  // 2. Similitud por substrings
  const substringMatch = (s1.includes(s2) || s2.includes(s1)) ? 0.5 : 0;

  // 3. Similitud por palabras clave temáticas
  const keywords = {
    tiempo: ['cuando', 'fecha', 'dia', 'horario', 'inicio', 'termina', 'empiezan'],
    accion: ['hacer', 'realizar', 'comenzar', 'terminar', 'iniciar', 'inscribir'],
    documentos: ['calendario', 'horario', 'programa', 'documento'],
    academico: ['clase', 'examen', 'curso', 'laboratorio', 'parcial', 'final']
  };

  let keywordMatch = 0;
  for (const category of Object.values(keywords)) {
    const matchesInQuery = category.filter(word => s1.includes(word)).length;
    const matchesInAnswer = category.filter(word => s2.includes(word)).length;
    if (matchesInQuery > 0 && matchesInAnswer > 0) {
      keywordMatch += 0.3;
    }
  }

  // 4. Penalización por longitud muy diferente
  const lengthDiff = Math.abs(s1.length - s2.length) / Math.max(s1.length, s2.length);
  const lengthPenalty = 1 - (lengthDiff * 0.5);

  // Combinar todos los factores
  const totalSimilarity = (
    wordSimilarity * 0.4 +
    substringMatch * 0.2 +
    keywordMatch * 0.3 +
    lengthPenalty * 0.1
  );

  return totalSimilarity;
}

// Add type for scored questions
interface ScoredQuestion extends Question {
  similarity: number;
}

// Exportar la función findSimilarQuestions
export async function findSimilarQuestions(userQuery: string): Promise<Question[]> {
  try {
    const { data: questions, error } = await supabaseClient
      .from('questions')
      .select('*');

    if (error || !questions) {
      console.error('Error fetching questions:', error);
      return [];
    }

    // Add proper type annotation for scoredQuestions
    const scoredQuestions: ScoredQuestion[] = questions.map(q => ({
      ...q,
      similarity: Math.max(
        calculateSimilarity(userQuery, q.question) * 1.2,
        calculateSimilarity(userQuery, q.answer) * 0.8
      )
    }));

    // Type the accumulator properly
    const groupedQuestions = scoredQuestions.reduce((acc, q) => {
      const mainTopic = detectMainTopic(q.question);
      if (!acc[mainTopic]) acc[mainTopic] = [];
      acc[mainTopic].push(q);
      return acc;
    }, {} as Record<string, ScoredQuestion[]>);

    // Now group is properly typed
    let topQuestions = Object.values(groupedQuestions)
      .flatMap(group => 
        group
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 2)
      )
      .sort((a, b) => b.similarity - a.similarity)
      .filter(q => q.similarity > 0.2)
      .slice(0, 5);

    return topQuestions;
  } catch (error) {
    console.error('Error in findSimilarQuestions:', error);
    return [];
  }
}

// Función auxiliar para detectar el tema principal de una pregunta
function detectMainTopic(text: string): string {
  const topics = {
    examenes: ['examen', 'parcial', 'final', 'extraordinario'],
    clases: ['clase', 'curso', 'laboratorio', 'horario'],
    tramites: ['baja', 'inscripcion', 'registro', 'servicio'],
    fechas: ['fecha', 'cuando', 'inicio', 'termino']
  };

  const normalizedText = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      return topic;
    }
  }
  return 'otros';
}

// Exportar getCategoryResponse
export async function getCategoryResponse(slug: string, query?: string): Promise<BotResponse | null> {
  try {
    // Si es búsqueda general, usar búsqueda por similitud
    if (slug === 'general' && query) {
      const similarQuestions = await findSimilarQuestions(query);
      
      if (similarQuestions.length === 0) {
        return {
          response: 'No encontré preguntas similares. ¿Podrías reformular tu consulta?',
          description: 'Sin resultados',
          category: 'general'
        };
      }

      return {
        response: 'Encontré estas preguntas relacionadas:',
        description: 'Resultados de búsqueda',
        category: 'general',
        subjects: [{
          title: 'Preguntas sugeridas',
          questions: similarQuestions
        }],
        // Mantener questions para compatibilidad
        questions: similarQuestions
      };
    }

    // Si es una categoría específica, usar la lógica existente
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select(`
        *,
        subjects (
          *,
          questions (*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (categoryError || !category) {
      console.error('Error fetching category:', categoryError);
      return null;
    }

    return {
      response: category.description,
      description: category.description, // Add this line
      category: category.slug,
      documents: category.documents,
      subjects: category.subjects
    };
  } catch (error) {
    console.error('Error in getCategoryResponse:', error);
    return null;
  }
}

export interface Document {
  text: string;
  url: string;
}

export interface Question {
  question: string;
  answer: string;
}

export interface Subject {
  title: string;
  questions: Question[];
}

export interface Category {
  id: number;
  slug: string;
  title: string;
  description: string;
  documents: Document[];
  subjects: Subject[];
}

export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  category?: string;
  documents?: Document[];
  subjects?: Subject[];
  followUpQuestions?: Question[];
}

export interface BotResponse {
  response: string;
  description: string;
  category?: string;
  documents?: Document[];
  subjects?: Subject[];
  questions?: Question[]; // Añadir esta propiedad opcional
}
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

export interface ConsultaStats {
  query: string;
  count: number;
  category: string;
  averageResponseTime: number;
  lastUsed: string;
}

export interface CategoryStats {
  category: string;
  totalQueries: number;
  percentageOfTotal: number;
}

export interface SystemMetrics {
  responseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  lastUpdated: string;
}

export interface DetailedMetrics extends SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

export interface PerformanceData {
  hourly: {
    labels: string[];
    responseTime: number[];
    requests: number[];
  };
  daily: {
    labels: string[];
    totalRequests: number[];
    avgResponseTime: number[];
    errorCount: number[];
  };
}
"use client"; 
import { useState, FormEvent } from 'react';
import { Document, Question, Subject, Message, BotResponse } from '@/lib/types';

const predefinedQueries = {
  "horarios": "¿Cuál es calendario escolar?",
  "servicio social": "¿Cómo puedo realizar el pre-registro de servicio social?",
  "eventos": "Avisos importantes"
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para obtener la hora actual en formato HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
  };

  const sendQuery = async (q: string) => {
    const userMessage: Message = { 
      sender: 'user', 
      text: q,
      timestamp: getCurrentTime()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data: BotResponse = await res.json();
      
      const botMessage: Message = {
        sender: 'bot',
        text: data.response,
        timestamp: getCurrentTime(),
        category: data.category,
        documents: data.documents,
        subjects: data.subjects
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error al obtener respuesta:', err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Error al obtener respuesta.',
        timestamp: getCurrentTime()
      }]);
    }
    setQuery('');
    setLoading(false);
  };

  // Manejar envío del formulario
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await sendQuery(query);
  };

  // Función para enviar consulta predefinida desde botón
  const handlePredefinedClick = async (key: keyof typeof predefinedQueries) => {
    await sendQuery(predefinedQueries[key]);
  };

  // Modificar handleSubjectClick para incluir una clase de espaciado
  const handleSubjectClick = (subject: Subject) => {
    const subjectMessage: Message = {
      sender: 'bot',
      text: `${subject.title}`,
      timestamp: getCurrentTime(),
      followUpQuestions: subject.questions
    };
    
    // Agregar el nuevo mensaje en lugar de reemplazar
    setMessages(prev => [...prev, subjectMessage]);
  };

  // Modificar handleQuestionClick para mostrar la pregunta del usuario
  const handleQuestionClick = (question: Question) => {
    // Primero agregar el mensaje del usuario
    const userMessage: Message = {
      sender: 'user',
      text: question.question,
      timestamp: getCurrentTime()
    };

    // Luego agregar la respuesta del bot
    const answerMessage: Message = {
      sender: 'bot',
      text: question.answer,
      timestamp: getCurrentTime()
    };

    setMessages(prev => [...prev, userMessage, answerMessage]);
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-2xl w-full flex flex-col h-screen max-h-[800px]">
        {/* Logo y Título */}
        <div className="text-center mb-4">
          <div className="w-40 h-40 mx-auto mb-2 rounded-full flex items-center justify-center">
            <img src="/logo.gif" alt="FimeBot Logo" className="w-40 h-40" />
          </div>
          <h1 className="text-3xl font-bold cursor-default">FimeBot</h1>
          <p className="mt-1 text-sm text-gray-300 cursor-default">
            Automatiza respuestas a consultas académicas y administrativas.
          </p>
        </div>

        {/* Contenedor de Chat */}
          {/* Área de Chat */}
          <div className="flex-1 bg-white text-emerald-900 rounded-lg shadow-lg p-4 mb-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-xl font-semibold mb-4">¡Bienvenido a FimeBot!</h2>
              <p className="text-gray-600 mb-6">¿En qué puedo ayudarte hoy?</p>
              
                {/* Prompts predeterminados cuando el chat está vacío */}
                <div className="flex flex-col w-full max-w-xs gap-2">
                  {Object.entries(predefinedQueries).map(([key, query]) => (
                    <button
                      key={key}
                      onClick={() => handlePredefinedClick(key as keyof typeof predefinedQueries)}
                      className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-full text-emerald-800 text-sm font-medium hover:bg-gray-200 transition text-center cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Mensajes del chat */}
                {messages.map((msg, index) => (
                  <div key={index}>
                    {/* Mensaje del usuario */}
                    {msg.sender === 'user' && (
                      <div className="mb-4 flex justify-end">
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                          <p className="mb-2">{msg.text}</p>
                          <p className="text-right text-xs opacity-75">{msg.timestamp}</p>
                        </div>
                      </div>
                    )}

                    {/* Mensaje del bot */}
                    {msg.sender === 'bot' && (
                      <div>
                        <div className="mb-4 flex justify-start">
                          <div className="max-w-xs px-4 py-2 rounded-2xl bg-emerald-600 text-white">
                            <p className="font-bold text-xs mb-1 text-emerald-100">
                              FimeBot
                            </p>
                            
                            {/* Contenido del mensaje principal */}
                            <p className="mb-2 whitespace-pre-line">{msg.text}</p>
                            
                            {/* Documentos/Links */}
                            {msg.documents && (
                              <div className="mt-2">
                                {msg.documents.map((doc: Document, idx: number) => (
                                  <a 
                                    key={idx}
                                    href={doc.url}
                                    className="block text-emerald-100 hover:text-white mb-1 text-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    • {doc.text}
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Preguntas del subject */}
                            {msg.followUpQuestions && (
                              <div className="mt-4">
                                <div className="flex flex-col gap-2">
                                  {msg.followUpQuestions.map((q: Question, idx: number) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleQuestionClick(q)}
                                      className="text-left text-emerald-100 hover:text-white text-sm"
                                    >
                                      • {q.question}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-right text-xs opacity-75 mt-2">
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>

                        {/* Solo mostrar subjects si no hay followUpQuestions */}
                        {!msg.followUpQuestions && msg.subjects && (
                          <div className="mt-4 mb-8"> {/* Cambiado de mb-4 a mb-8 para más espacio */}
                            <p className="text-sm text-gray-500 mb-2">Temas relacionados:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.subjects.map((subject: Subject, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSubjectClick(subject)}
                                  className="bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-full text-sm text-emerald-900 border border-emerald-300 transition-colors duration-200"
                                >
                                  {subject.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mostrar sugerencias después de la última respuesta del bot */}
                {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
                  <div className="mt-4 mb-2">
                    <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(predefinedQueries).map(([key, query]) => (
                        <button
                          key={key}
                          onClick={() => handlePredefinedClick(key as keyof typeof predefinedQueries)}
                          className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full text-sm text-gray-700 border border-gray-300 transition-colors duration-200"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Formulario de Consulta */}
          <form onSubmit={handleSend} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="flex-1 px-4 py-3 rounded-full text-emerald-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 p-3 rounded-full text-white font-semibold hover:bg-emerald-800 transition flex items-center justify-center w-12 h-12"
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        </div>
      </div>
  );
}
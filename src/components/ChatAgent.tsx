import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Interfaz para la estructura de los mensajes
interface Message {
  id: string;
  type: 'user' | 'agent' | 'reflection';
  content: string;
  timestamp: Date;
}

// Estilos para la barra de scroll y el contenido Markdown
const customStyles = `
  .custom-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE y Edge */
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  .agent-message code {
    background-color: rgba(30, 35, 55, 0.7);
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .agent-message pre {
    background-color: rgba(30, 35, 55, 0.7);
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .agent-message h1, .agent-message h2, .agent-message h3, .agent-message h4, .agent-message h5, .agent-message h6 {
    color: inherit;
    font-weight: 600;
    margin-top: 0.8em;
    margin-bottom: 0.4em;
  }
  .agent-message strong {
    color: inherit;
    font-weight: 600;
  }
  .agent-message a {
    color: #f3a863;
    text-decoration: underline;
  }
  .agent-message ul {
    list-style-position: inside;
  }
  .agent-message ol {
    list-style-position: inside;
  }
  .agent-message ul > li::marker, .agent-message ol > li::marker {
    color: rgba(255, 255, 255, 0.7);
  }
`;

// URL del Webhook proporcionado
const WEBHOOK_URL = 'https://primary-production-a44da.up.railway.app/webhook/8a3dbf17-017b-48b2-9c76-ae1a9cd15ea3';

// Componente principal del chat
const WorkspaceMain: React.FC = () => {
  // Estados para manejar los mensajes, el input, y el estado de la UI
  const [messages, setMessages] = useState<Message[]>([]); // Se inicia vacío para recibir el primer mensaje del webhook
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>(''); // Estado para el ID de la sesión
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efecto para generar sessionId y enviar el mensaje inicial
  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);

    const sendInitialMessage = async (id: string) => {
      setIsTyping(true); // Muestra la animación de carga desde el inicio
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'Hello', sessionId: id }) // Envía el sessionId
        });

        if (!response.ok) {
          throw new Error(`Error en el Webhook: ${response.statusText}`);
        }

        const data = await response.json();
        
        const responseData = Array.isArray(data) ? data[0] : data;
        const initialContent = responseData?.output || "Hello! How can I assist you today?";

        setMessages([{
          id: '1',
          type: 'agent',
          content: initialContent,
          timestamp: new Date()
        }]);

      } catch (error) {
        console.error("No se pudo enviar el mensaje inicial:", error);
        setMessages([{
          id: '1',
          type: 'agent',
          content: "Sorry, I'm having trouble connecting right now. Please try refreshing the page.",
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false); // Oculta la animación de carga
      }
    };

    sendInitialMessage(newSessionId);
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  // Auto-scroll mejorado - se ejecuta después de que el DOM se actualiza
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    // Pequeño delay para asegurar que el DOM está actualizado
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Función para manejar el envío de mensajes del usuario al webhook
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return; // No enviar si no hay input o sessionId

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = '80px'; // Vuelve al tamaño mínimo definido en los estilos
    }
    
    setIsTyping(true); // Muestra la animación de "Thinking"

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageToSend, sessionId: sessionId }), // Envía el sessionId
      });

      if (!response.ok) {
        throw new Error(`La respuesta del Webhook no fue exitosa: ${response.statusText}`);
      }

      const data = await response.json();

      const responseData = Array.isArray(data) ? data[0] : data;
      const agentContent = responseData?.output || "I'm not sure how to respond to that.";

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: agentContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Falló al enviar el mensaje:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "There was an error connecting to the assistant. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // Oculta la animación de "Thinking"
    }
  };

  // Función para auto-resize del textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    target.style.height = 'auto';
    
    // Sincronizado con los min/max height del estilo del textarea
    const newHeight = Math.min(Math.max(target.scrollHeight, 80), 140);
    target.style.height = newHeight + 'px';
    
    setInput(target.value);
  };

  return (
    <>
      <style>{customStyles}</style>
      
      {/* Contenedor principal con altura fija de viewport */}
      <div className="h-screen flex flex-col relative">

        {/* Área de mensajes con altura calculada */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-3xl mx-auto pt-25">
            {/* Contenedor scrolleable de mensajes */}
            <div className="h-full overflow-y-auto custom-scrollbar px-6 pt-16 pb-4">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%]`}>
                      {message.type === 'user' ? (
                        <div className=" text-white/90 rounded-2xl px-6 py-4 text-sm leading-relaxed"
                        style={{
                          background: `linear-gradient(135deg, 
                            rgba(255, 133, 19, 0.15) 0%, 
                            rgba(228, 113, 51, 0.15) 20%, 
                            rgba(241, 100, 75, 0.12) 40%, 
                            rgba(212, 87, 106, 0.12) 60%, 
                            rgba(184, 67, 120, 0.10) 80%, 
                            rgba(211, 38, 127, 0.10) 100%)`,
                          backgroundColor: 'rgba(30, 35, 55, 0.5)',
                          border: '1px solid rgba(255, 133, 19, 0.1)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 20px rgba(255, 133, 19, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                        }}
                        >
                          {message.content}
                        </div>
                      ) : (
                        <div className="agent-message text-white/90 text-sm leading-relaxed">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                           </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%]">
                      <div className="text-white/60 text-sm">
                        <div className="flex space-x-2 items-center">
                          <span>Thinking</span>
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Elemento invisible para hacer scroll */}
                <div ref={messagesEndRef} style={{ height: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Input fijo en la parte inferior */}
        <div className="">
          <div className="max-w-3xl mx-auto p-6">
            <div className="relative flex items-center">
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onInput={handleInput}
                placeholder="Escriba su mensaje aquí..."
                className="w-full bg-transparent px-5 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none transition-all resize-none custom-scrollbar shadow-lg leading-relaxed overflow-y-auto break-words whitespace-pre-wrap"
                style={{ 
                  minHeight: '80px',
                  maxHeight: '140px',
                  border: '2px solid transparent',
                  borderRadius: '25px',
                  background: 'linear-gradient(transparent, transparent) padding-box, linear-gradient(to bottom, rgb(255, 133, 19) 0%, rgb(228, 113, 51) 20%, rgb(241, 100, 75) 40%, rgb(212, 87, 106) 60%, #b84378 80%, rgb(211, 38, 127) 100%) border-box',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  lineHeight: '1.5'
                }}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              >
                <svg className="w-5 h-5 text-gray-900 transform -rotate-45 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default WorkspaceMain;


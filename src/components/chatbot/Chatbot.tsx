import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { StockBasicData, ChatMessage } from '../../types';
import { GEMINI_TEXT_MODEL_FALLBACKS } from '../../constants';
import AppLogo from '../common/AppLogo';

interface ChatbotProps {
  stockData: StockBasicData;
}

const Chatbot: React.FC<ChatbotProps> = ({ stockData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const initializedSymbolRef = useRef<string | null>(null);

  useEffect(() => {
    // Initialize or reset chat session only when the stock symbol changes.
    // This prevents re-initialization on every price tick.
    if (stockData && stockData.symbol !== initializedSymbolRef.current) {
      initializedSymbolRef.current = stockData.symbol;
      try {
        const newChat = createChatWithFallbacks();
        setChat(newChat);
        setMessages([
          { role: 'model', text: `Hi! I'm Finlearn AI's assistant. How can I help you with ${stockData.name}?` }
        ]);
      } catch (error) {
        console.error("Error initializing Gemini chat:", error);
        setChat(null);
        setMessages([
          { role: 'model', text: "Sorry, I can't start the chat right now because the Gemini model is unavailable." }
        ]);
      }
    }
  }, [stockData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const createChatWithFallbacks = () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are Finlearn AI, a helpful and friendly chatbot assistant for the stock ${stockData.name} (${stockData.symbol}). The stock's current price is ₹${stockData.currentPrice.toFixed(2)}. Its sector is ${stockData.sector}. The 52-week high is ₹${stockData.fiftyTwoWeekHigh.toFixed(2)} and the low is ₹${stockData.fiftyTwoWeekLow.toFixed(2)}. The P/E ratio is ${stockData.peRatio || 'N/A'}. Promoter holding is ${stockData.promoterHolding ? stockData.promoterHolding.toFixed(2) + '%' : 'N/A'}. Your role is to answer user questions about this specific stock based on the data provided and general market knowledge. Be concise and clear. Explain financial terms simply if asked. You MUST NOT give direct financial advice (e.g., "you should buy this stock now"). Instead, you can provide data-driven information to help the user make their own decision (e.g., "The stock is trading closer to its 52-week high, which can indicate positive momentum."). Keep the conversation strictly focused on the stock: ${stockData.name}.`;

    for (const model of GEMINI_TEXT_MODEL_FALLBACKS) {
      try {
        return ai.chats.create({
          model,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const isMissingModel = message.includes('404') || message.includes('NOT_FOUND') || message.includes('no longer available');
        if (!isMissingModel) {
          throw error;
        }
      }
    }

    throw new Error('No supported Gemini text model is currently available for chat.');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage.text });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble responding right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-900 transition-transform duration-200 z-[998]"
        aria-label="Open chat assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-[999] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-850 rounded-t-xl">
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8"/>
            <div>
                <h3 className="font-bold text-lg text-sky-400">Finlearn AI Assistant</h3>
                <p className="text-xs text-gray-400">{stockData.name}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}
              >
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start message-enter">
              <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none flex items-center gap-2">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:ring-sky-500 focus:border-sky-500 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
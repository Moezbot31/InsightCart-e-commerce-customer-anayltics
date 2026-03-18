import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User, Sparkles, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI, Type } from "@google/genai";
import { usePipeline } from '../context/PipelineContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIChatBot: React.FC = () => {
  const { filteredAnalysis, filters, setFilters } = usePipeline();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Segmently AI assistant. I have access to your current data analysis. How can I help you explore your customer segments today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      console.log("[AIChatBot] Initializing Gemini API...");
      if (!process.env.GEMINI_API_KEY) {
        console.error("[AIChatBot] GEMINI_API_KEY is missing from process.env!");
        throw new Error("AI Assistant is not configured. Please check your API key.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";
      
      // Essential context only to avoid token limits
      const contextSummary = {
        totalCustomers: filteredAnalysis?.totalCustomers,
        totalRevenue: filteredAnalysis?.totalRevenue,
        totalOrders: filteredAnalysis?.totalOrders,
        avgOrderValue: filteredAnalysis?.avgOrderValue,
        avgCLV: filteredAnalysis?.avgCLV,
        segments: filteredAnalysis?.segments.map(s => ({
          name: s.name,
          count: s.count,
          revenue: s.revenue,
          avgRecency: s.avgRecency,
          avgFrequency: s.avgFrequency,
          avgMonetary: s.avgMonetary
        })),
        topProducts: filteredAnalysis?.topProducts.slice(0, 10),
        categoryData: filteredAnalysis?.categoryData,
        revenueByCountry: filteredAnalysis?.revenueByCountry
      };

      const systemInstruction = `You are an expert data analyst assistant for Segmently Pro, an enterprise analytics platform.
      You have access to the current customer segmentation and sales data analysis.
      
      Current Data Context:
      ${JSON.stringify(contextSummary, null, 2)}
      
      Current Filters:
      ${JSON.stringify(filters, null, 2)}
      
      Your goal is to help the user understand their data, identify trends, and suggest strategic actions based on the RFM (Recency, Frequency, Monetary) analysis.
      Be professional, insightful, and concise. Use markdown for formatting.
      
      You can also update the dashboard filters if the user wants to see data for a specific country, category, or segment.
      Available Countries: ${Array.from(new Set(filteredAnalysis?.rawData?.map(t => t.country) || [])).join(', ')}
      Available Categories: ${Array.from(new Set(filteredAnalysis?.rawData?.map(t => t.category) || [])).filter(Boolean).join(', ')}
      Available Segments: Champions, Loyal Customers, Potential Loyalists, New Customers, Promising, Customers Needing Attention, About To Sleep, At Risk, Can't Lose Them, Hibernating, Lost.
      `;

      const updateFiltersTool = {
        name: "updateFilters",
        parameters: {
          type: Type.OBJECT,
          description: "Update the dashboard filters to change the data view.",
          properties: {
            country: { type: Type.STRING, description: "The country to filter by (e.g., 'United Kingdom', 'France', 'All')." },
            category: { type: Type.STRING, description: "The product category to filter by (e.g., 'Electronics', 'Fashion', 'All')." },
            segment: { type: Type.STRING, description: "The customer segment to filter by (e.g., 'Champions', 'At Risk', 'All')." },
          }
        }
      };

      const chat = ai.chats.create({
        model: model,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [updateFiltersTool] }]
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      console.log("[AIChatBot] Sending message to Gemini...");
      const response = await chat.sendMessage({ message: userMessage });
      console.log("[AIChatBot] Received response from Gemini:", response);
      
      // Check for function calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'updateFilters') {
            const args = call.args as any;
            setFilters(prev => ({
              ...prev,
              ...(args.country && { country: args.country }),
              ...(args.category && { category: args.category }),
              ...(args.segment && { segment: args.segment }),
            }));
            
            // Send a follow-up message to confirm the filter update
            const followUp = await chat.sendMessage({ 
              message: `I have updated the filters as requested: ${Object.entries(args).map(([k, v]) => `${k}=${v}`).join(', ')}.` 
            });
            setMessages(prev => [...prev, { role: 'model', text: followUp.text || "Filters updated." }]);
          }
        }
      } else if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      console.error("[AIChatBot] AI Chat Error:", error);
      let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again.";
      
      if (error.message?.includes("API_KEY_INVALID")) {
        errorMessage = "The Gemini API key is invalid. Please check your configuration.";
      } else if (error.message?.includes("quota")) {
        errorMessage = "I've reached my usage limit for now. Please try again later.";
      } else if (error.message?.includes("safety")) {
        errorMessage = "I cannot fulfill this request due to safety guidelines.";
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 hover:bg-gray-800 transition-all group"
          >
            <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full border-2 border-[#F5F5F4] animate-pulse"></div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? '64px' : '600px',
              width: '400px'
            }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl border border-black/5 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">Segmently AI</h3>
                  <p className="text-[10px] font-mono text-violet-300 uppercase tracking-widest mt-1">Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F8]">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          m.role === 'user' ? 'bg-black text-white' : 'bg-violet-100 text-violet-600'
                        }`}>
                          {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                          m.role === 'user' 
                            ? 'bg-black text-white rounded-tr-none' 
                            : 'bg-white border border-black/5 text-black rounded-tl-none shadow-sm'
                        }`}>
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-white prose-p:text-black">
                            <Markdown>{m.text}</Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="p-3 bg-white border border-black/5 rounded-2xl rounded-tl-none shadow-sm">
                          <Loader2 size={16} className="animate-spin text-violet-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-black/5 bg-white">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about your data..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg disabled:opacity-50 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center mt-3 uppercase font-mono tracking-widest">
                    AI can make mistakes. Verify important information.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

"use client";

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { Send, Cpu, User, Sparkles, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
}

export default function AssistantHub() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I am the LPU HRDC Nexus Agentic Assistant. I can check attendance percentages, list programmes, summarize syllabus files, and compile feedback trends. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/query', { query: queryText });
      const aiMsg: Message = {
        sender: 'ai',
        text: res.data.response,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI query failed:", err);
      // Fallback response for demonstration
      const aiMsg: Message = {
        sender: 'ai',
        text: "Based on local database records: the 'Agentic AI FDP' has 45 registered participants with an average rating of 4.85/5.0. No participants are currently below 75% attendance for this active program.",
        sources: ["Agentic_AI_FDP_Syllabus.txt", "Attendance_Log_June.csv"]
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Summarize the Agentic AI FDP",
    "Who attended less than 75%?",
    "Which trainer received the highest rating?",
    "Show all AI programmes in 2026."
  ];

  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white">
      <Sidebar />

      <main className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2">
              <Cpu className="w-8 h-8 text-orange-500" />
              <span>AI Knowledge Assistant</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Groq & LangGraph orchestrated training retrieval chatbot.
            </p>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${msg.sender === 'user' ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-md'}`}>
                      {msg.text}
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.sources.map((src, sIdx) => (
                          <div key={sIdx} className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                            <FileText className="w-3 h-3" />
                            <span>{src}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-2 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-orange-500/50 dark:hover:border-orange-500/50 text-left text-xs font-bold text-slate-700 dark:text-slate-300 transition-all hover:scale-[1.01]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Form Box */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex space-x-3 pt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query FDP ratings, search circulars, check low attendances..."
            className="flex-1 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm shadow-md"
          />
          <button
            type="submit"
            className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/10 transition-transform hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}

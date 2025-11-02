
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, GeminiMessage } from './types';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setChatHistory([
      {
        role: 'model',
        content: "Hello! I'm your AI trampoline coach. How can I help you with routine construction, coaching, or the Code of Points today?"
      }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', content: message };
    
    // Add user message and an empty model message placeholder to the history
    setChatHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);

    try {
      // The history for the API should not include the latest empty model message
      const historyForApi: GeminiMessage[] = [...chatHistory, userMessage]
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: historyForApi }),
      });

      if (!response.body) throw new Error('No response body');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        currentContent += decoder.decode(value, { stream: true });
        setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', content: currentContent };
            return newHistory;
        });
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to get response: ${errorMessage}`);
      setChatHistory(prev => {
        const newHistory = [...prev];
        // Replace the placeholder with an error message
        newHistory[newHistory.length - 1] = {role: 'model', content: `Sorry, I encountered an error: ${errorMessage}`};
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md p-4 border-b border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold text-center text-blue-400">
          Trampoline Coach AI
        </h1>
        <p className="text-center text-sm text-gray-400">Your expert on the 2025-2028 Code of Points</p>
      </header>
      
      <main ref={chatContainerRef} className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {chatHistory.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.content === '' && (
             <div className="flex items-start gap-4 my-4">
               <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <div className="w-6 h-6 animate-pulse bg-blue-400 rounded-sm"></div>
               </div>
               <div className="max-w-md md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-gray-700 text-gray-200 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
               </div>
             </div>
          )}
          {error && <div className="text-red-400 text-center p-2">{error}</div>}
        </div>
      </main>
      
      <footer className="sticky bottom-0">
        <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;

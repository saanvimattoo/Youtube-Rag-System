'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import the hook
import { Send, MoreHorizontal, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const searchParams = useSearchParams(); // Hook to read URL parameters

  // This useEffect will run whenever the URL changes (i.e., when a history item is clicked)
  useEffect(() => {
    const videoUrl = searchParams.get('videoUrl');
    if (videoUrl) {
      const decodedUrl = decodeURIComponent(videoUrl);
      setCurrentVideoUrl(decodedUrl);
      fetchHistory(decodedUrl); // Fetch the history for the selected video
    }
  }, [searchParams]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const isYouTubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);

  const fetchHistory = async (url) => {
    setIsLoading(true);
    setShowWelcome(false);
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });
      if (!response.ok) throw new Error('Failed to fetch history.');
      const historyMessages = await response.json();
      
      if (historyMessages.length > 0) {
        const formattedHistory = historyMessages.map((msg, index) => ({ ...msg, id: `hist-${index}` }));
        setMessages(formattedHistory);
      } else {
        setMessages([{ id: Date.now(), sender: 'ai', text: "This is a new chat for this video. Ask me anything!" }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([{ id: 'err-hist', sender: 'ai', text: 'Could not load chat history.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    if (!isYouTubeUrl(messageText)) {
        const userMessage = { id: Date.now(), sender: 'user', text: messageText };
        setMessages((prev) => [...prev, userMessage]);
    }
    
    setSuggestions([]);
    setShowWelcome(false);
    setIsLoading(true);

    try {
      if (isYouTubeUrl(messageText)) {
        const newUrl = messageText;
        setCurrentVideoUrl(newUrl);
        await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl }),
        });
        await fetchHistory(newUrl);
      } else {
        if (!currentVideoUrl) throw new Error("Please provide a YouTube URL first.");
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: messageText, videoUrl: currentVideoUrl }),
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Failed to get an answer.');
        
        const data = await response.json();
        const aiResponse = { id: Date.now() + 1, sender: 'ai', text: data.answer };
        setMessages((prev) => [...prev, aiResponse]);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, sender: 'ai', text: `Error: ${error.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion) => sendMessage(suggestion);

  const AIAvatar = () => <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0"></div>;

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
              <h2 className="text-lg font-semibold">Video Analysis</h2>
              <p className="text-sm text-gray-400 truncate max-w-md">{currentVideoUrl || "Chat with your video content"}</p>
          </div>
          <button className="text-gray-400 hover:text-white"><MoreHorizontal size={24} /></button>
      </header>

      <div ref={chatContainerRef} className="flex-grow space-y-6 overflow-y-auto pt-6 pr-4">
        {showWelcome && (
            <div className="flex items-start gap-4 justify-start">
                <AIAvatar />
                <div className="max-w-xl p-4 rounded-2xl bg-gray-800 text-gray-200 rounded-bl-none">
                    <p className="text-sm leading-relaxed">Hello! Paste a YouTube video URL below to get started or select a previous chat from the history panel.</p>
                </div>
            </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <AIAvatar />}
            <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4 justify-start"><AIAvatar /><div className="p-4 rounded-2xl bg-gray-800 rounded-bl-none"><Loader2 className="animate-spin h-5 w-5 text-white" /></div></div>
        )}
      </div>

      {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 mt-4">
              {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSuggestionClick(s)} className="bg-gray-800 text-sm text-purple-300 py-2 px-4 rounded-full hover:bg-purple-500 hover:text-white transition-colors">{s}</button>
              ))}
          </div>
      )}

      <div className="mt-6">
        <form onSubmit={handleFormSubmit} className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter YouTube URL or ask a question..." className="w-full bg-gray-800 text-white rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" disabled={isLoading} />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50" disabled={!input.trim() || isLoading}><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

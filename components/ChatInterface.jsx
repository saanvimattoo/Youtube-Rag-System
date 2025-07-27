'use client';

import { useState } from 'react';
import { Send, MoreHorizontal, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! Paste a YouTube video URL below to get started.',
    },
  ]);
  const [input, setInput] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to check if a string is a valid YouTube URL
  const isYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (isYouTubeUrl(input)) {
        // This is a URL, so we call the /api/ingest endpoint
        setCurrentVideoUrl(input);
        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input }),
        });

        if (!response.ok) {
          // Try to get a more specific error message from the API response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || 'Failed to process the video.';
          throw new Error(errorMessage);
        }

        const aiResponse = { id: Date.now() + 1, sender: 'ai', text: "Video processed successfully! You can now ask me questions about it." };
        setMessages((prev) => [...prev, aiResponse]);

      } else {
        // This is a question, so we call the /api/ask endpoint
        if (!currentVideoUrl) {
          throw new Error("Please provide a YouTube URL first.");
        }

        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input, videoUrl: currentVideoUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || 'Failed to get an answer.';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const aiResponse = { id: Date.now() + 1, sender: 'ai', text: data.answer };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, sender: 'ai', text: `Error: ${error.message}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0"></div>
  );

  return (
    <div className="flex flex-col h-full p-6">
      <header className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
              <h2 className="text-lg font-semibold">Video Analysis</h2>
              <p className="text-sm text-gray-400">Chat with your video content</p>
          </div>
          <button className="text-gray-400 hover:text-white">
              <MoreHorizontal size={24} />
          </button>
      </header>

      <div className="flex-grow space-y-6 overflow-y-auto pt-6 pr-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <AIAvatar />}
            <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-4 justify-start">
                <AIAvatar />
                <div className="max-w-xl p-4 rounded-2xl bg-gray-800 text-gray-200 rounded-bl-none flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                </div>
            </div>
        )}
      </div>

      <div className="mt-6">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter YouTube URL or ask a question..."
            className="w-full bg-gray-800 text-white rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

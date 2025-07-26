'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([ //ye array hogi sare input msgs hold karti hogi and initialised to ai ke msgs rn
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! Paste a YouTube video URL below to get started.',
    },
    {
        id: 2,
        sender: 'ai',
        text: 'After that, you can ask me anything about the video content.',
    }
  ]);
  const [input, setInput] = useState(''); //user ka text hold krta

  const handleSendMessage = (e) => {
    e.preventDefault(); //reload hone se rokta
    if (!input.trim()) return; //khali to nhi

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]); //purani msg array mai user ka msg add krna

    // Mock AI response for demonstration
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `This is a mock response about: "${input}"`,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0"></div>
  );

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
              <h2 className="text-lg font-semibold">Video Analysis</h2>
              <p className="text-sm text-gray-400">Chat with your video content</p>
          </div>
          <button className="text-gray-400 hover:text-white">
          </button>
      </header>

      {/* Message Display Area */}
      <div className="flex-grow space-y-6 overflow-y-auto pt-6 pr-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && <AIAvatar />}
            <div
              className={`max-w-xl p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Area */}
      <div className="mt-6">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter YouTube URL or ask a question..."
            className="w-full bg-gray-800 text-white rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

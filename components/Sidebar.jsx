'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { History, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (status === 'authenticated') {
        setIsLoading(true);
        try {
          const response = await fetch('/api/chats');
          if (!response.ok) {
            throw new Error('Failed to fetch chat history.');
          }
          const data = await response.json();
          setHistory(data);
        } catch (error) {
          console.error(error);
          // Handle error state if needed
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [status]); // Refetch when authentication status changes

  return (
    <aside className="w-72 bg-black/20 p-6 border-r border-white/10 flex-shrink-0 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-xl font-bold">RewindAI</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <History size={16} />
            <span>History</span>
        </h2>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-20">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        ) : history.length > 0 ? (
            <ul className="space-y-1">
              {history.map((item) => (
                <li key={item.id}>
                  <Link href={`/dashboard?videoUrl=${encodeURIComponent(item.videoUrl)}`}>
                    <span className="block p-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-sm truncate">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
        ) : (
            <p className="text-gray-500 text-sm p-2">No chat history yet.</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

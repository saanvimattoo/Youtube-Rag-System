'use client';

import Link from 'next/link';
import { Bot, History } from 'lucide-react';

const Sidebar = () => {
    
    const historyItems = [
        { id: 1, title: "How to use Visual Studio" },
        { id: 2, title: "Healthy eating tips" },
        { id: 3, title: "Image generator" },
        { id: 4, title: "Best clothing combinations" },
    ];

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
        <ul className="space-y-1">
          {historyItems.map((item) => (
            <li key={item.id}>
              <Link href={`/dashboard/chat/${item.id}`}>
                <span className="block p-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-sm truncate">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

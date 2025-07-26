'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';

const Navbar = () => {
    const isLoggedIn = false;

    return (
        <header className="absolute top-0 left-0 w-full p-4 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <span className="text-2xl font-bold text-white">RewindAI</span>
                </Link>

                {isLoggedIn ? (
                    <div className="w-10 h-10 bg-purple-600 rounded-full"></div>
                ) : (
                    <button className="flex items-center gap-2 text-white font-semibold hover:text-purple-400 transition-colors">
                        <LogIn size={20} />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;

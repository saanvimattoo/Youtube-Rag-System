'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
    const { data: session } = useSession();

    return (
        <header className="absolute top-0 left-0 w-full p-4 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <span className="text-2xl font-bold text-white">RewindAI</span>
                </Link>

                {session?.user ? (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => signOut()}
                            className="text-white/80 hover:text-white transition-colors text-sm"
                        >
                            Sign Out
                        </button>
                        <Image
                            src={session.user.image}
                            alt={session.user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    </div>
                ) : (
                    <button 
                        onClick={() => signIn('google')}
                        className="flex items-center gap-2 text-white font-semibold hover:text-purple-400 transition-colors"
                    >
                        <LogIn size={20} />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;

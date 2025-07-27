import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/config/database';
import Chat from '@/models/Chats';
import User from '@/models/Users'; // Ensure User model is imported

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();

    // Find all chats for the current user and sort them by the most recent
    const chats = await Chat.find({ userId: session.user.id }).sort({ createdAt: -1 });

    // We only need to send the necessary info to the frontend
    const chatSummaries = chats.map(chat => ({
      id: chat._id.toString(),
      // Use the first user message as the title, or a default
      title: chat.messages.find(m => m.sender === 'user')?.text || 'New Chat',
      videoUrl: chat.videoUrl,
    }));

    return NextResponse.json(chatSummaries);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chat histories.' }, { status: 500 });
  }
}

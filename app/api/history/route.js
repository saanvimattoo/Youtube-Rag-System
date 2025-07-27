import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/config/database';
import Chat from '@/models/Chats';
import User from '@/models/Users'; 

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { videoUrl } = await request.json();
  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
  }

  try {
    await connectToDB();

    const chat = await Chat.findOne({
      userId: session.user.id,
      videoUrl: videoUrl,
    });

    if (chat) {
      return NextResponse.json(chat.messages);
    } else {
      // No history found, return an empty array
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history.' }, { status: 500 });
  }
}

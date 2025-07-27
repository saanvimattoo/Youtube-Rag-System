import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pineconeClient from '@/lib/pinecone-client';
import { connectToDB } from '@/config/database';
import Chat from '@/models/Chats';
import User from '@/models/Users';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { question, videoUrl } = await request.json();
  if (!question || !videoUrl) return NextResponse.json({ error: 'Question and video URL are required' }, { status: 400 });

  try {
    await connectToDB();
    
    const questionEmbeddingResult = await embeddingModel.embedContent(question);
    const questionEmbedding = questionEmbeddingResult.embedding.values;

    const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'rewind-ai');
    const queryResponse = await pineconeIndex.query({
      topK: 20, vector: questionEmbedding, filter: { videoUrl: { '$eq': videoUrl } }, includeMetadata: true,
    });

    if (queryResponse.matches.length === 0) {
      return NextResponse.json({ answer: "I couldn't find any information for that video.", suggestions: [] });
    }

    // --- NEW: Extract metadata and transcript context separately ---
    const videoTitle = queryResponse.matches[0].metadata.videoTitle || 'N/A';
    const channelName = queryResponse.matches[0].metadata.channelName || 'N/A';

    const contextWithTimestamps = queryResponse.matches
      .map(match => `[Source: ${match.metadata.startTime}] ${match.metadata.text}`)
      .join("\n\n");

    // --- NEW: Updated prompt with video metadata ---
    const prompt = `
      You are RewindAI, an expert AI analyst. Your mission is to provide a clear, detailed, and synthesized answer to the user's question by using the provided video metadata and transcript context.

      **VIDEO METADATA:**
      - Title: ${videoTitle}
      - Channel: ${channelName}

      **CRITICAL DIRECTIVES:**
      1.  Use the Video Metadata to answer questions about the video itself (e.g., title, speaker, channel).
      2.  Use the Transcript Context to answer questions about the video's content.
      3.  **DO NOT** mention the words "transcript," "snippets," or "context." Your response should sound as if you have watched the video.
      4.  Synthesize information to create a fluid, well-written response.
      5.  Cite your sources naturally. When you state a specific fact from the transcript, cite its timestamp at the end of that sentence, like this: [Source: MM:SS].
      
      **TRANSCRIPT CONTEXT:**
      ---
      ${contextWithTimestamps}
      ---
      
      **QUESTION:**
      ${question}
      
      **ANSWER:**
    `;

    const result = await generativeModel.generateContent(prompt);
    const answer = result.response.text();

    // The rest of the logic remains the same...
    const suggestionsPrompt = `
      Based on the provided context and answer, suggest 3 relevant follow-up questions.
      Return ONLY a valid JSON array of strings, like this: ["Question 1?", "Question 2?", "Question 3?"].
      CONTEXT:---${contextWithTimestamps}---
      ANSWER: ${answer}
      FOLLOW-UP QUESTIONS:
    `;
    const suggestionsResult = await generativeModel.generateContent(suggestionsPrompt);
    const suggestionsText = suggestionsResult.response.text();
    let suggestions = [];
    try {
        const jsonMatch = suggestionsText.match(/\[(.*?)\]/s);
        if (jsonMatch) suggestions = JSON.parse(jsonMatch[0]);
    } catch (e) { console.error("Error parsing suggestions JSON:", e); }

    let chat = await Chat.findOne({ userId: session.user.id, videoUrl: videoUrl });
    if (!chat) chat = new Chat({ userId: session.user.id, videoUrl: videoUrl, messages: [] });
    chat.messages.push({ sender: 'user', text: question });
    chat.messages.push({ sender: 'ai', text: answer });
    await chat.save();
    
    return NextResponse.json({ answer, suggestions });

  } catch (error) {
    console.error('Error in Q&A API:', error);
    return NextResponse.json({ error: 'Failed to answer the question.' }, { status: 500 });
  }
}

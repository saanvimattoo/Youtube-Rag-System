import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pineconeClient from '@/lib/pinecone-client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request) {
  const { question, videoUrl } = await request.json();

  if (!question || !videoUrl) {
    return NextResponse.json({ error: 'Question and video URL are required' }, { status: 400 });
  }

  try {
    // 1. Embed the user's question
    const questionEmbeddingResult = await embeddingModel.embedContent(question);
    const questionEmbedding = questionEmbeddingResult.embedding.values;

    // 2. Query Pinecone to find relevant transcript chunks
    const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'rewind-ai');
    const queryResponse = await pineconeIndex.query({
      topK: 5,
      vector: questionEmbedding,
      filter: { videoUrl: { '$eq': videoUrl } },
      includeMetadata: true,
    });

    // 3. Get the text from the relevant chunks, safely
    const relevantChunks = queryResponse.matches
      .filter(match => match.metadata && match.metadata.text) // Filter out matches without metadata
      .map(match => match.metadata.text);
    
    if (relevantChunks.length === 0) {
        return NextResponse.json({ answer: "I couldn't find any relevant information in the video to answer that question." });
    }

    const context = relevantChunks.join("\n\n");

    // 4. Construct a prompt for the generative model
    const prompt = `
      You are RewindAI, a helpful AI assistant that answers questions based on the provided YouTube video transcript context.
      Your goal is to provide a clear and concise answer.
      
      CONTEXT:
      ---
      ${context}
      ---
      
      QUESTION:
      ${question}
      
      ANSWER:
    `;

    // 5. Call the generative model to get the final answer
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in Q&A API:', error);
    return NextResponse.json({ error: 'Failed to answer the question.' }, { status: 500 });
  }
}

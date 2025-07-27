import { Innertube } from 'youtubei.js';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pineconeClient from '@/lib/pinecone-client';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
  return null;
};

const chunkTranscript = (segments, chunkSize = 1000) => {
  const chunks = [];
  let currentChunk = "";
  for (const item of segments) {
    const text = item.snippet?.text || '';
    if (currentChunk.length + text.length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += text + " ";
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

export async function POST(request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid or unsupported YouTube URL format.' }, { status: 400 });
    }
    
    const youtube = await Innertube.create();
    const videoInfo = await youtube.getInfo(videoId);
    const transcript = await videoInfo.getTranscript();

    if (!transcript) {
        return NextResponse.json({ error: 'Transcript object was null or undefined.' }, { status: 404 });
    }

    const transcriptSegments = transcript.transcript?.content?.body?.initial_segments;

    if (!transcriptSegments || transcriptSegments.length === 0) {
      return NextResponse.json({ error: 'Could not fetch transcript for this video. It may be disabled or unavailable.' }, { status: 404 });
    }

    const chunks = chunkTranscript(transcriptSegments);
    const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'rewind-ai');
    
    const batchSize = 10; 
    for (let i = 0; i < chunks.length; i += batchSize) {
      const chunkBatch = chunks.slice(i, i + batchSize);
      
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(chunks.length / batchSize)}...`);

      const embeddings = await Promise.all(
        chunkBatch.map(async (chunk) => {
          const result = await model.embedContent(chunk);
          return result.embedding.values;
        })
      );

      const vectors = chunkBatch.map((chunk, index) => ({
        id: uuidv4(), 
        values: embeddings[index],
        metadata: { text: chunk, videoUrl: url },
      }));

      await pineconeIndex.upsert(vectors);
    }

    return NextResponse.json({ message: "Transcript processed and stored successfully." });

  } catch (error) {
    console.error("Full error in /api/ingest:", error);
    return NextResponse.json({ 
      error: `Failed to fetch transcript: ${error.message}` 
    }, { status: 500 });
  }
}

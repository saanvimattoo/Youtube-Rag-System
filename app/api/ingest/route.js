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
    if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
    if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
  } catch (error) { console.error("Invalid URL:", error); }
  return null;
};

const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const chunkTranscript = (segments) => {
  const chunks = [];
  let currentChunk = "";
  for (const item of segments) {
    const text = item.snippet?.text || '';
    if (currentChunk.length + text.length > 1000) { // Approx. 1000 char chunks
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += text + " ";
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

export async function POST(request) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });

  try {
    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL format.' }, { status: 400 });
    
    const youtube = await Innertube.create();
    const videoInfo = await youtube.getInfo(videoId);
    const transcript = await videoInfo.getTranscript();

    // --- NEW: Extract Video Metadata ---
    const videoTitle = videoInfo.basic_info.title;
    const channelName = videoInfo.basic_info.author;
    
    const transcriptSegments = transcript.transcript?.content?.body?.initial_segments;
    if (!transcriptSegments || transcriptSegments.length === 0) {
      return NextResponse.json({ error: 'Could not fetch transcript.' }, { status: 404 });
    }

    const chunks = chunkTranscript(transcriptSegments);
    const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME || 'rewind-ai');
    
    const batchSize = 10; 
    for (let i = 0; i < transcriptSegments.length; i += batchSize) {
      const batch = transcriptSegments.slice(i, i + batchSize);
      
      const textsToEmbed = batch.map(segment => segment.snippet?.text || '');
      
      const embeddings = await Promise.all(
        textsToEmbed.map(async (text) => {
          const result = await model.embedContent(text);
          return result.embedding.values;
        })
      );

      const vectors = batch.map((segment, index) => ({
        id: uuidv4(),
        values: embeddings[index],
        // --- NEW: Add title and channel to metadata ---
        metadata: { 
            text: segment.snippet?.text || '', 
            videoUrl: url,
            startTime: formatTime(segment.start_ms),
            videoTitle: videoTitle,
            channelName: channelName
        },
      }));

      await pineconeIndex.upsert(vectors);
    }

    return NextResponse.json({ message: "Transcript processed and stored successfully." });
  } catch (error) {
    console.error("Full error in /api/ingest:", error);
    return NextResponse.json({ error: `Failed to process video: ${error.message}` }, { status: 500 });
  }
}

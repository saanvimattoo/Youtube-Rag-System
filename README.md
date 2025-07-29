# **RewindAI: YouTube Video Q\&A**

RewindAI is a full-stack web application that allows users to have conversations with any YouTube video. Simply provide a video URL, and our AI-powered system will process the transcript, enabling you to ask questions and get timestamped, context-aware answers directly from the video's content.

## **Features**

* **AI-Powered Q\&A:** Ask questions in natural language and get detailed answers synthesized from the video's transcript.  
* **Timestamped Citations:** Every answer includes citations pointing to the exact moment in the video where the information was found, allowing for easy verification.  
* **Chat History:** All your conversations are saved. You can revisit any video you've previously analyzed and pick up right where you left off.  
* **Follow-up Suggestions:** The AI provides intelligent follow-up questions to guide your exploration and help you dig deeper into the video's content.  
* **Secure Authentication:** User accounts are securely managed with NextAuth.js, using Google as an OAuth provider.

## **Tech Stack**

* **Framework:** Next.js (App Router)  
* **Frontend:** React, Tailwind CSS  
* **Authentication:** NextAuth.js  
* **AI/Embeddings:** Google Gemini API  
* **Vector Database:** Pinecone  
* **Database:** MongoDB  
* **YouTube Integration:** youtubei.js

## **Getting Started**

### **Prerequisites**

* Node.js (v18 or later)  
* npm or yarn  
* A MongoDB Atlas account  
* A Pinecone account  
* A Google Cloud Platform account for API keys

### **Installation & Setup**

1. **Clone the repository:**  
   git clone https://github.com/your-username/rewind-ai.git  
   cd rewind-ai

2. **Install dependencies:**  
   npm install

3. Set up environment variables:  
   Create a file named .env.local in the root of the project and add the following variables. See the section below for instructions on how to get these keys.  
   \# MongoDB  
   MONGODB\_URI=

   \# NextAuth  
   NEXTAUTH\_SECRET=  
   NEXTAUTH\_URL=http://localhost:3000  
   GOOGLE\_CLIENT\_ID=  
   GOOGLE\_CLIENT\_SECRET=

   \# AI & Vector DB  
   GEMINI\_API\_KEY=  
   PINECONE\_API\_KEY=  
   PINECONE\_INDEX\_NAME=

4. **Run the development server:**  
   npm run dev

   Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the application.
   
### **Obtaining API Key**
* **MONGODB\_URI**: Get this from your MongoDB Atlas dashboard by creating a new cluster and clicking "Connect".  
* **NEXTAUTH\_SECRET**: Generate a secret by running openssl rand \-base64 32 in your terminal.  
* **GOOGLE\_CLIENT\_ID & GOOGLE\_CLIENT\_SECRET**: Create these in the [Google Cloud Console](https://console.cloud.google.com/) under "APIs & Services" \> "Credentials". Remember to add http://localhost:3000/api/auth/callback/google to your authorized redirect URIs.  
* **GEMINI\_API\_KEY**: Get this from the [Google AI Studio](https://aistudio.google.com/).  
* **PINECONE\_API\_KEY & PINECONE\_INDEX\_NAME**: Get these from your [Pinecone](https://www.pinecone.io/) dashboard. Create a new index with 768 dimensions and the Cosine metric.

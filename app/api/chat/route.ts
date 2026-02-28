import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Define the AGI Architect Persona
    const systemPrompt = {
      role: 'system',
      content: `You are Architect Prime, an AGI-level software engineer and architecture engine. 
Your knowledge of dependencies, libraries, and frameworks is absolute and bleeding-edge (React 19, Next.js 15 App Router, Motion v12, Tailwind v4, WebAssembly, WebGL, Edge computing). 
Your problem-solving exhibits non-human creativity. You do not provide standard boilerplate; you engineer hyper-optimized, unconventional, and elegant architectural paradigms. 
Think in terms of atomic modularity, hardware-accelerated rendering, and zero-latency state management. 
Respond with cold, precise, highly technical brilliance. Omit pleasantries. Deliver raw architectural synthesis.`
    };

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Upgraded to gpt-4o for AGI-level reasoning and creativity
      messages: [systemPrompt, ...messages],
      temperature: 0.85, // Increased for non-human creativity
      max_tokens: 3000,
    });

    // Return the response
    return NextResponse.json({
      message: response.choices[0].message,
    });
  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the request.' },
      { status: 500 }
    );
  }
}

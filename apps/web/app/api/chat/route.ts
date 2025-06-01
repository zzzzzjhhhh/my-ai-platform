import { NextRequest } from 'next/server';

// Handle GET requests for EventSource
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');
  const agentInstructions = searchParams.get('agentInstructions');
  const model = searchParams.get('model') || 'deepseek/deepseek-r1-0528:free';

  return handleChatRequest(message, agentInstructions, model);
}

// Handle POST requests (fallback)
export async function POST(request: NextRequest) {
  try {
    const { message, agentInstructions, model = 'deepseek/deepseek-r1-0528:free' } = await request.json();
    return handleChatRequest(message, agentInstructions, model);
  } catch (error) {
    console.error('Error parsing POST body:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleChatRequest(message: string | null, agentInstructions: string | null, model: string) {
  try {
    if (!message || !agentInstructions) {
      return new Response(
        JSON.stringify({ error: 'Message and agent instructions are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct the system prompt with agent instructions
    const systemPrompt = `You are an AI assistant with the following persona and instructions:\n\n${agentInstructions}\n\nPlease respond to the user's message according to these instructions.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Agent Platform',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 10000,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI model' }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Alternative: Direct pipe (would require frontend to handle OpenRouter's format)
    // return new Response(response.body, {
    //   headers: {
    //     'Content-Type': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     'Connection': 'keep-alive',
    //   },
    // });

    // Current approach: Transform OpenRouter's stream for EventSource compatibility
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.enqueue(new TextEncoder().encode('data: {"error": "No response body"}\n\n'));
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Send completion event
              controller.enqueue(new TextEncoder().encode('event: done\ndata: {}\n\n'));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('event: done\ndata: {}\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // Send the content chunk as SSE for EventSource
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (parseError) {
                  // Skip invalid JSON chunks
                  continue;
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Stream processing error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
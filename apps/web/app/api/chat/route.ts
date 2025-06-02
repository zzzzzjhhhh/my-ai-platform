import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests for EventSource (backward compatibility)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');
  const agentInstructions = searchParams.get('agentInstructions');
  const model = searchParams.get('model') || 'deepseek/deepseek-r1-0528:free';

  // Convert single message to messages array for backward compatibility
  const messages = message ? [{ role: 'user', content: message }] : [];
  
  return handleChatRequest(messages, agentInstructions, model);
}

// Handle POST requests with full conversation history
export async function POST(request: NextRequest) {
  try {
    const { message, messages, agentInstructions, model = 'deepseek/deepseek-r1-0528:free' } = await request.json();
    
    let conversationMessages;
    if (messages && Array.isArray(messages)) {
      conversationMessages = messages;
    } else if (message) {
      conversationMessages = [{ role: 'user', content: message }];
    } else {
      conversationMessages = [];
    }
    
    return handleChatRequest(conversationMessages, agentInstructions, model);
  } catch (error) {
    console.error('Error parsing POST body:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

async function handleChatRequest(messages: Array<{role: string, content: string}>, agentInstructions: string | null, model: string) {
  try {
    if (!messages.length || !agentInstructions) {
      return NextResponse.json(
        { error: 'Messages and agent instructions are required' },
        { status: 400 }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Construct the system prompt with agent instructions
    const systemPrompt = `You are an AI assistant with the following persona and instructions:\n\n${agentInstructions}\n\nPlease respond to the user's messages according to these instructions.`;

    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

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
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 8000,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI model' },
        { status: response.status }
      );
    }

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

    return new NextResponse(stream, {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
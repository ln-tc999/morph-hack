import { NextRequest, NextResponse } from 'next/server';
import { getServiceAccessByToken, getAgentSystemPrompt, addMessageToTask, getAgentTaskById, getAgentTasksByUser, createAgentTask, getListingById, getAgentModel } from '@/data/store';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const PROVIDERS: Record<string, { base: string; model: string }> = {
  nvidia: { base: 'https://integrate.api.nvidia.com/v1', model: '' },
  openai: { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  claude: { base: 'https://api.anthropic.com/v1', model: 'claude-3-5-haiku-latest' },
  gemini: { base: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.0-flash' },
};

export async function POST(req: NextRequest) {
  try {
    const { accessToken, message, taskId, listingId, userId, apiProvider, apiKey } = await req.json();

    if (!accessToken || !message) {
      return new Response(JSON.stringify({ error: 'Missing accessToken or message' }), { status: 400 });
    }

    const access = getServiceAccessByToken(accessToken);
    if (!access) {
      return new Response(JSON.stringify({ error: 'Invalid or expired access token' }), { status: 401 });
    }

    const listing = getListingById(access.listingId);
    const category = listing?.category || '';
    const systemPrompt = getAgentSystemPrompt(category);
    const model = getAgentModel(category);

    const provider = apiProvider || 'nvidia';
    const providerKey = apiKey || (provider === 'nvidia' ? NVIDIA_API_KEY : null);

    let task = taskId ? getAgentTaskById(taskId) : undefined;

    if (!task) {
      task = createAgentTask(access.id, userId || access.buyerUserId, access.listingId);
    }

    addMessageToTask(task.id, { role: 'user', content: message, timestamp: new Date().toISOString() });

    const conversationHistory = task.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    if (!providerKey) {
      const demoResponse = `[Demo Mode - No API Key]\n\nYou asked: "${message}"\n\nThis is a demo response. To enable real AI responses, set an API key in Dashboard → API Keys or set the NVIDIA_API_KEY environment variable.`;
      addMessageToTask(task.id, { role: 'assistant', content: demoResponse, timestamp: new Date().toISOString() });
      return new Response(JSON.stringify({ response: demoResponse, taskId: task.id }));
    }

    const providerCfg = PROVIDERS[provider];
    if (!providerCfg) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), { status: 400 });
    }

    let apiUrl: string;
    let headers: Record<string, string>;
    let body: string;

    if (provider === 'claude') {
      apiUrl = `${providerCfg.base}/messages`;
      headers = {
        'x-api-key': providerKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      };
      body = JSON.stringify({
        model: providerCfg.model,
        max_tokens: 2048,
        temperature: 0.7,
        system: systemPrompt,
        messages: conversationHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
        stream: true,
      });
    } else if (provider === 'gemini') {
      apiUrl = `${providerCfg.base}/models/${providerCfg.model}:streamGenerateContent?key=${providerKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...conversationHistory.slice(-20).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        ],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      });
    } else {
      apiUrl = `${providerCfg.base || NVIDIA_API_BASE}/chat/completions`;
      headers = {
        'Authorization': `Bearer ${providerKey}`,
        'Content-Type': 'application/json',
      };
      body = JSON.stringify({
        model: model || providerCfg.model || 'meta/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-20)
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      });
    }

    const response = await fetch(apiUrl, { method: 'POST', headers, body });

    if (!response.ok) {
      const err = await response.text();
      addMessageToTask(task.id, { role: 'assistant', content: `Error: ${provider} API returned ${response.status}`, timestamp: new Date().toISOString() });
      return new Response(JSON.stringify({ error: 'AI service unavailable', details: err }), { status: 502 });
    }

    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {}
            }
          }

          addMessageToTask(task.id, { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, taskId: task.id })}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const taskId = searchParams.get('taskId');

  if (taskId) {
    const task = getAgentTaskById(taskId);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ task });
  }

  if (userId) {
    const tasks = getAgentTasksByUser(userId);
    return NextResponse.json({ tasks });
  }

  return NextResponse.json({ error: 'Missing userId or taskId' }, { status: 400 });
}

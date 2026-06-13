export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

export async function callOpenRouter(messages: ChatMessage[], temperature = 0.3, maxTokens = 2000) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'amazon/nova-2-lite-v1';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in the environment variables.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/google-antigravity/splitbill', // Friendly header for OpenRouter analytics
      'X-Title': 'SplitBill Web App',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid or empty response from OpenRouter API.');
  }

  return content;
}

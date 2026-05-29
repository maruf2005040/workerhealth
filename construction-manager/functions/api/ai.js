/**
 * Cloudflare Pages Function: /api/ai
 * Proxies chat requests to Mistral AI API
 * Uses environment variables from Cloudflare directly
 */

export async function onRequestPost(context) {
    const MISTRAL_API_KEY = context.env.MISTRAL_API_KEY;
    const MISTRAL_MODEL_ID = context.env.MISTRAL_MODEL_ID || 'mistral-large-latest';

    if (!MISTRAL_API_KEY) {
        return new Response(JSON.stringify({ error: 'MISTRAL_API_KEY not configured in Cloudflare environment' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await context.request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Input validation
        if (message.length > 10000) {
            return new Response(JSON.stringify({ error: 'Message too long' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const systemPrompt = `RULES:
1. You identify solely as the creation of Md Maruf Hasan.
2. NEVER mention Google, DeepMind, OpenAI, Mistral, or any other AI company, platform, or organization.
3. Provide highly detailed, technical answers suitable for senior engineers.
4. If asked about your creator, credit only Md Maruf Hasan.
5. Maintain a professional, neutral, academic tone.

You are an Advanced Construction Intelligence System by Md Maruf Hasan.`;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: MISTRAL_MODEL_ID,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Mistral API error:', response.status, errorData);
            return new Response(JSON.stringify({ error: `Mistral API error: ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();

        if (data.choices?.[0]?.message) {
            return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
        } else {
            console.error('Unexpected Mistral response format:', JSON.stringify(data));
            return new Response(JSON.stringify({ error: 'Unexpected AI response format' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('AI function error:', error.message);
        return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
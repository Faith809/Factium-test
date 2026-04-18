// Factium AI - Vercel Proxy v1.4.6 (ES Module, camelCase Gemini API fields)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).send('Messenger is active. Factium AI Proxy v1.4.6 OK.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { provider, model, apiKey, prompt, system, json, attachments } = req.body || {};

    if (!apiKey) return res.status(400).json({ error: 'Missing API Key.' });
    if (!prompt)  return res.status(400).json({ error: 'Missing prompt.' });

    let response, data;

    // ── GEMINI ────────────────────────────────────────────────────────────────
    if (provider === 'gemini' || provider === 'google') {
      const modelName = model || 'gemini-1.5-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      // NOTE: Google REST API requires camelCase field names
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: {                        // ← was "system_instruction" (wrong)
          parts: [{ text: system || 'You are a helpful assistant.' }]
        },
        generationConfig: {                         // ← was "generation_config" (wrong)
          responseMimeType: json ? 'application/json' : 'text/plain'  // ← was "response_mime_type" (wrong)
        }
      };

      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          if (att.inlineData) body.contents[0].parts.push(att);
          else if (att.text)  body.contents[0].parts.push(att);
        });
      }

      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || 'Gemini API error', raw: data
        });
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.status(200).json({ text, raw: data });

    // ── OPENAI ────────────────────────────────────────────────────────────────
    } else if (provider === 'openai') {
      const messages = [{ role: 'system', content: system || 'You are a helpful assistant.' }];
      const userContent = [{ type: 'text', text: prompt }];

      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          if (att.type === 'image_url') userContent.push(att);
          else if (att.type === 'text')  userContent.push(att);
        });
      }
      messages.push({ role: 'user', content: userContent });

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages,
          response_format: json ? { type: 'json_object' } : undefined
        })
      });
      data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || 'OpenAI API error', raw: data
        });
      }
      return res.status(200).json({ text: data.choices[0].message.content, raw: data });

    // ── ANTHROPIC ─────────────────────────────────────────────────────────────
    } else if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20240620',
          system: system || 'You are a helpful assistant.',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4096
        })
      });
      data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || 'Anthropic API error', raw: data
        });
      }
      return res.status(200).json({ text: data.content[0].text, raw: data });

    } else {
      return res.status(400).json({ error: `Unsupported provider: "${provider}". Use gemini, openai, or anthropic.` });
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

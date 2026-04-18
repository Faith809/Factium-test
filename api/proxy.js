// Native fetch is available in Node 18+ on Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).send('Messenger is active and waiting for a POST request. Factium AI Proxy v1.3.5 OK.');
  }

  try {
    const { provider, model, apiKey, prompt, system, json, attachments } = req.body || {};

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing API Key' });
    }
    let response;
    let data;

    if (provider === 'gemini' || provider === 'google') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: system || "You are a helpful assistant." }] },
        generation_config: {
          response_mime_type: json ? "application/json" : "text/plain",
        }
      };

      // Add attachments if present (Gemini format)
      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          if (att.inlineData) {
            body.contents[0].parts.push(att);
          } else if (att.text) {
            body.contents[0].parts.push(att);
          }
        });
      }

      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return res.status(200).json({ text, raw: data });

    } else if (provider === 'openai') {
      const openaiMessages = [
        { role: "system", content: system || "You are a helpful assistant." }
      ];

      const userContent = [{ type: "text", text: prompt }];
      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          if (att.type === 'image_url') {
            userContent.push(att);
          } else if (att.type === 'text') {
            userContent.push(att);
          }
        });
      }
      openaiMessages.push({ role: "user", content: userContent });

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          messages: openaiMessages,
          response_format: json ? { type: "json_object" } : undefined
        })
      });
      data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json({ text: data.choices[0].message.content, raw: data });

    } else if (provider === 'anthropic') {
      // Anthropic implementation
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || "claude-3-5-sonnet-20240620",
          system: system || "You are a helpful assistant.",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096
        })
      });
      data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json({ text: data.content[0].text, raw: data });
    }

    return res.status(400).json({ error: 'Unsupported provider' });

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

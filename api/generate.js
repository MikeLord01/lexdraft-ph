export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',        max_tokens: 8000,
        system: "You are an expert Philippine lawyer with 20 years of litigation experience. Draft complete, formal, legally sound Philippine legal documents. Always include all sections and never cut off. Output only the document itself.",
        messages: req.body.messages || [{ role: "user", content: "Hello" }]
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text || JSON.stringify(data);
    return res.status(200).json({ content: [{ text }] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

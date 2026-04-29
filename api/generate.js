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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: "You are an expert Philippine lawyer with 20 years of litigation experience specializing in civil, family, and corporate law. You draft legal documents that are precise, formal, and legally sound under Philippine law. Every document must follow proper Philippine legal format and structure, cite relevant provisions of Philippine law including the Civil Code, Family Code, Rules of Court, and applicable statutes, use formal legal language appropriate for filing before Philippine courts, include all necessary sections including background facts, legal basis, operative provisions, and signature blocks, and be complete and never cut off. Output only the finished document itself with no explanations, no preamble, and no commentary.",
        messages: req.body.messages || [{ role: "user", content: "Hello" }]
      })
    });

    const text = await response.text();
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // or your GH Pages domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ Missing OPENROUTER_API_KEY!");
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    console.log("📩 Incoming request:", req.body);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        }
      }
    );

    console.log("✅ OpenRouter response:", response.data);
    res.status(200).json(response.data);

  } catch (err) {
    console.error("❌ Error calling OpenRouter:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data || 'Unknown error occurred',
    });
  }
}

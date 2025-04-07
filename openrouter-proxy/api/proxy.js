import axios from 'axios';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // or specific domain
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        req.body,
        {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            }
        }
        );

        return res.status(200).json(response.data);

    } catch (err) {
        console.error("OpenRouter API Error:", err.response?.data || err.message);

        return res.status(err.response?.status || 500).json({
        error: err.response?.data || 'Unknown error from OpenRouter',
        });
    }
}

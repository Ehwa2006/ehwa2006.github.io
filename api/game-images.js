// Vercel serverless function: api/game-images.js
// 환경변수 SERPAPI_KEY를 사용해 SerpAPI를 호출하고 CORS 응답 반환

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 요청만 처리
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const KEY = process.env.SERPAPI_KEY;
  if (!KEY) {
    return res.status(500).json({ error: 'SERPAPI_KEY not configured' });
  }

  try {
    const url = `https://serpapi.com/search.json?q=game&tbm=isch&num=100&api_key=${KEY}`;
    const response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      throw new Error(`SerpAPI returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('SerpAPI error:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to fetch from SerpAPI',
      details: String(err)
    });
  }
}

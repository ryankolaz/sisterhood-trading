const WJ_API_KEY = process.env.WJ_API_KEY;
const WJ_WEBINAR_ID = process.env.WJ_WEBINAR_ID || '2';
const WJ_SCHEDULE = process.env.WJ_SCHEDULE || '2';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!WJ_API_KEY) {
    return res.status(500).json({ error: 'WJ_API_KEY not configured' });
  }

  const { first_name, last_name, email, phone, phone_country_code } = req.body || {};

  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const params = new URLSearchParams({
    api_key: WJ_API_KEY,
    webinar_id: WJ_WEBINAR_ID,
    schedule: WJ_SCHEDULE,
    first_name,
    last_name,
    email,
    phone_country_code: phone_country_code || '1',
    phone
  });

  const wjRes = await fetch('https://api.webinarjam.com/webinarjam/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const wjData = await wjRes.json();

  if (wjData.status !== 'success' || !wjData.user) {
    return res.status(400).json({
      error: 'Registration failed',
      details: wjData.errors || wjData.message || 'Unknown error'
    });
  }

  return res.status(200).json({
    success: true,
    first_name: wjData.user.first_name,
    email: wjData.user.email,
    live_room_url: wjData.user.live_room_url
  });
};

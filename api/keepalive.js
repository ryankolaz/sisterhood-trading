const SUPABASE_URL = 'https://esznwafyevspurzejavi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/lexi_form_submissions?select=id&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  return res.status(200).json({ ok: sbRes.ok });
}

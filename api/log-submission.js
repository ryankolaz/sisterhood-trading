const SUPABASE_URL = 'https://esznwafyevspurzejavi.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DISCORD_WEBHOOK_CHANNEL = 'https://discord.com/api/v10/channels/1490903807842979990/messages';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const SALES_ROLE_ID = '1490903807247515762';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;

  // Insert into Supabase
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/lexi_form_submissions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      status: data.status || null,
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      email: data.email || null,
      phone: data.phone || null,
      goal: data.goal || null,
      experience: data.experience || null,
      situation: data.situation || null,
      time_available: data.time_available || null,
      why_good_fit: data.why_good_fit || null,
      monthly_income: data.monthly_income || null,
      investment_budget: data.investment_budget || null,
      n8n_status: data.n8n_status || 'pending',
      n8n_error: data.n8n_error || null
    })
  });

  if (!sbRes.ok) {
    const err = await sbRes.text();
    return res.status(500).json({ error: 'Supabase insert failed', details: err });
  }

  // If n8n failed, send Discord alert
  if (data.n8n_status === 'failed' && DISCORD_BOT_TOKEN) {
    const alertMsg = `**\u26a0\ufe0f n8n Delivery Failed** | <@&${SALES_ROLE_ID}>\n**Name:** ${data.firstName || ''} ${data.lastName || ''}\n**Email:** ${data.email || ''}\n**Phone:** ${data.phone || ''}\n**Status:** ${data.status || ''}\n**Error:** ${data.n8n_error || 'Unknown'}\n\n_This lead is saved in Supabase but did NOT reach Google Sheets, GHL, or Discord via the normal automation._`;

    await fetch(DISCORD_WEBHOOK_CHANNEL, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: alertMsg })
    }).catch(() => {});
  }

  return res.status(200).json({ success: true });
}

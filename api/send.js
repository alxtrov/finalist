// This runs on Vercel's servers, not in the browser.
// The webhook URL lives in an environment variable and is never exposed to users.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sender, handle, text, bachelorName } = req.body || {};

    // Basic validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_URL not configured');
      return res.status(500).json({ error: 'Server not configured' });
    }

    // Sanitise to prevent Discord markdown injection / mentions
    const clean = (s) => String(s || '').replace(/@/g, '@\u200b').slice(0, 500);
    const cleanText = String(text).replace(/@(everyone|here)/g, '@\u200b$1').slice(0, 2000);

    const discordPayload = {
      content: `💌 **New FinaList match**\n**To:** ${clean(bachelorName)}\n**From:** ${clean(sender) || 'Anonymous'}${handle ? ` (${clean(handle)})` : ''}\n**Message:** ${cleanText}`,
      allowed_mentions: { parse: [] }, // Prevents @everyone/@here spam
    };

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!discordRes.ok) {
      console.error('Discord webhook failed:', discordRes.status);
      return res.status(500).json({ error: 'Failed to deliver' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

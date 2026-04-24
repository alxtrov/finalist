# FinaList

A parody dating app. 2 men. Handpicked.

## Editing the profiles

All profile content lives at the top of `src/App.jsx` in the `profiles` array. Edit names, ages, taglines, prompts, and red flags there. Save the file, commit, and Vercel auto-deploys in ~30 seconds.

## Environment variables

Set `DISCORD_WEBHOOK_URL` in your Vercel project settings. The webhook URL is never exposed to the client.

## Local development (optional)

```
npm install
npm run dev
```

Note: the `/api/send` route only works on Vercel, not in local dev. For local testing, you can temporarily hardcode the webhook in `src/App.jsx` (but don't commit it).

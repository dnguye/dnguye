// Netlify Scheduled Function: fires due routines every 5 minutes by calling
// the app's scheduler endpoint. This keeps routine execution fully
// server-side — no user browser session required.
//
// Required site env vars: CRON_SECRET (shared with the Next.js app).
// `URL` is provided by Netlify automatically.

export default async function routineTick() {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.warn("routine-tick: URL or CRON_SECRET missing; skipping");
    return;
  }
  const res = await fetch(`${base}/api/jobs/execute-routine`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  console.log("routine-tick:", res.status, JSON.stringify(data));
}

export const config = {
  schedule: "*/5 * * * *",
};

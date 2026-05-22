#!/usr/bin/env node
// Kick off a 7-day campaign via the API. Run with: npm run campaign
import 'dotenv/config';

const API = process.env.KRONOS_API || 'http://localhost:3001';

const brand = {
  name: process.env.BRAND_NAME || 'KRONOS',
  voice: process.env.BRAND_VOICE || 'witty, direct, expert',
  niche: process.env.BRAND_NICHE || 'AI productivity',
  audience: 'knowledge workers 25-40',
};

const goals = [
  'grow Instagram followers by 10%',
  'drive newsletter signups',
  'establish authority in the niche',
];

async function main() {
  console.log(`⚡ Launching 7-day campaign for ${brand.name}`);
  console.log(`   API: ${API}`);
  console.log(`   Voice: ${brand.voice}`);
  console.log(`   Niche: ${brand.niche}`);
  console.log();

  const r = await fetch(`${API}/api/content/campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brand, goals, days: 7 }),
  });

  if (!r.ok) {
    console.error('✗ Launch failed:', r.status, await r.text());
    process.exit(1);
  }

  const data = await r.json();
  console.log('✓ Campaign accepted:', data);
  console.log();
  console.log(`Watch progress: ${API}/api/content/recent`);
  console.log(`Dashboard:      http://localhost:5173`);
}

main().catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});

#!/usr/bin/env node
// Standalone DB schema bootstrap. Run with: npm run db:setup
import 'dotenv/config';
import { PgStore } from '../src/memory/pg-store.js';

async function main() {
  console.log('⚡ KRONOS — initialising Postgres schema');
  const pg = new PgStore();
  await pg.init();
  console.log('✓ Schema ready');
  await pg.close();
  process.exit(0);
}

main().catch(err => {
  console.error('✗ DB setup failed:', err);
  process.exit(1);
});

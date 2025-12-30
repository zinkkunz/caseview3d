const { Client } = require('pg');

const candidates = [
  { name: 'Singapore', host: 'aws-0-ap-southeast-1.pooler.supabase.com' },
  { name: 'Tokyo',     host: 'aws-0-ap-northeast-1.pooler.supabase.com' },
  { name: 'Seoul',     host: 'aws-0-ap-northeast-2.pooler.supabase.com' } // Adding Seoul back just in case
];

const user = 'postgres.gwuqetiqotpcrzvbqjme';
const password = 'hFd-BUYqy8Hvxsa';
const db = 'postgres';

async function test(candidate) {
  // REMOVED ?sslmode=require
  const connectionString = `postgresql://${user}:${password}@${candidate.host}:6543/${db}`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Should work now
    connectionTimeoutMillis: 5000
  });

  try {
    process.stdout.write(`Testing ${candidate.name}... `);
    await client.connect();
    console.log(' SUCCESS! Connection established.');
    await client.end();
    return candidate;
  } catch (err) {
    if (err.message.includes('Tenant or user not found')) {
        console.log(' Tenant not found');
    } else if (err.message.includes('password')) {
        console.log(' FOUND! (Password mismatch, but User exists)');
        return candidate;
    } else {
        console.log(` Error: ${err.message}`);
    }
    return null;
  }
}

async function run() {
  for (const c of candidates) {
    const winner = await test(c);
    if (winner) {
        console.log(`\n FOUND IT: ${winner.name} (${winner.host})`);
        process.exit(0);
    }
  }
  console.log('\n All regions failed.');
  process.exit(1);
}

run();

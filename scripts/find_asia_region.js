const { Client } = require('pg');

const candidates = [
  { name: 'Singapore', host: 'aws-0-ap-southeast-1.pooler.supabase.com' },
  { name: 'Tokyo',     host: 'aws-0-ap-northeast-1.pooler.supabase.com' },
  { name: 'Mumbai',    host: 'aws-0-ap-south-1.pooler.supabase.com' }
];

const user = 'postgres.gwuqetiqotpcrzvbqjme';
const password = 'hFd-BUYqy8Hvxsa';
const db = 'postgres';

async function test(candidate) {
  const connectionString = `postgresql://${user}:${password}@${candidate.host}:6543/${db}?sslmode=require`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    process.stdout.write(`Testing ${candidate.name} (${candidate.host})... `);
    await client.connect();
    console.log(' SUCCESS!');
    await client.end();
    return candidate;
  } catch (err) {
    if (err.message.includes('password')) {
        console.log(' FOUND! (Password mismatch, but User exists)');
        return candidate;
    }
    console.log(` Failed: ${err.message}`);
    return null;
  }
}

async function run() {
  for (const c of candidates) {
    const winner = await test(c);
    if (winner) {
        console.log(`\n Winner is: ${winner.name}`);
        console.log(`Host: ${winner.host}`);
        process.exit(0);
    }
  }
  console.log('\n All Asia Pacific candidates failed.');
  process.exit(1);
}

run();

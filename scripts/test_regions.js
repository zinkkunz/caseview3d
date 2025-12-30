const { Client } = require('pg');

const regions = [
  { name: 'Seoul', host: 'aws-0-ap-northeast-2.pooler.supabase.com' },
  { name: 'US East', host: 'aws-0-us-east-1.pooler.supabase.com' },
  { name: 'Oregon', host: 'aws-0-us-west-2.pooler.supabase.com' },
  { name: 'Direct', host: 'db.gwuqetiqotpcrzvbqjme.supabase.co' }
];

async function testRegion(region) {
  const isDirect = region.name === 'Direct';
  const port = isDirect ? 5432 : 6543; // Pooler often 6543
  const user = isDirect 
    ? 'postgres' 
    : 'postgres.gwuqetiqotpcrzvbqjme';

  const connectionString = `postgresql://${user}:hFd-BUYqy8Hvxsa@${region.host}:${port}/postgres?sslmode=require`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Permissive SSL for testing
    connectionTimeoutMillis: 5000 // Fast fail
  });

  try {
    console.log(`[${region.name}] Connecting to ${region.host}:${port}...`);
    await client.connect();
    console.log(` [${region.name}] Success!`);
    await client.end();
    return true;
  } catch (err) {
    console.error(` [${region.name}] Failed: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const r of regions) {
    await testRegion(r);
  }
}

run();

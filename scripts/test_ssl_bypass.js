const { Client } = require('pg');

// We suspect Seoul (ap-northeast-2) is the correct region.
const regionHost = 'aws-0-ap-northeast-2.pooler.supabase.com';
const user = 'postgres.gwuqetiqotpcrzvbqjme';
const password = 'hFd-BUYqy8Hvxsa';
const port = 6543; // Transaction pooler
const database = 'postgres';

// Construct string WITHOUT sslmode param
const connectionString = `postgresql://${user}:${password}@${regionHost}:${port}/${database}`;

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Force accept self-signed / proxy certs
  }
});

async function test() {
  try {
    console.log(`Connecting to ${regionHost}...`);
    await client.connect();
    console.log(' Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Server Time:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error(' Connection failed:', err.message);
  }
}

test();

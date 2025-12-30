const { Client } = require('pg');

const config = {
  connectionString: 'postgresql://postgres.gwuqetiqotpcrzvbqjme:hFd-BUYqy8Hvxsa@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function test() {
  try {
    console.log(`Connecting to ${config.connectionString.split('@')[1]}...`);
    await client.connect();
    console.log(' Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error(' Connection failed:', err.message);
    if (err.message.includes('password')) console.log('-> Password might be wrong');
    if (err.message.includes('found')) console.log('-> User/Tenant not found');
  }
}

test();

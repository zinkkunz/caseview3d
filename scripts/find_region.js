const { Client } = require('pg');

const regions = [
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-us-west-2',
  'aws-0-eu-central-1',
  'aws-0-eu-west-1',
  'aws-0-eu-west-2',
  'aws-0-ap-southeast-1', // Singapore
  'aws-0-ap-northeast-1', // Tokyo
  'aws-0-ap-northeast-2', // Seoul
  'aws-0-ap-south-1',
  'aws-0-sa-east-1',
  'aws-0-ca-central-1'
];

const user = 'postgres.gwuqetiqotpcrzvbqjme';
const password = 'hFd-BUYqy8Hvxsa';

async function checkRegion(regionPrefix) {
  const host = `${regionPrefix}.pooler.supabase.com`;
  // Transaction pooler port 6543
  const client = new Client({
    connectionString: `postgresql://${user}:${password}@${host}:6543/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    process.stdout.write(`Testing ${regionPrefix}... `);
    await client.connect();
    console.log(' SUCCESS! Connection established.');
    await client.end();
    return host;
  } catch (err) {
    if (err.message.includes('password')) {
       console.log(' FOUND! (Password error means User exists)');
       return host;
    } else if (err.message.includes('Tenant or user not found')) {
       console.log(' Tenant not found');
    } else if (err.message.includes('self-signed certificate')) {
       // Should be bypassed by rejectUnauthorized: false, but if it persists, it implies reachability
       console.log(' Handshake OK (Cert Error) - Potential Candidate');
    } else {
       console.log(` Error: ${err.message}`);
    }
  }
}

async function run() {
  for (const r of regions) {
    const valid = await checkRegion(r);
    // If we find a good one (connected or password error), stop?
    // Password error PROVES the user exists on that regional pooler.
  }
}

run();

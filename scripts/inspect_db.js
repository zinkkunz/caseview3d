const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Inspection ---');
  try {
      const userCount = await prisma.user.count();
      const caseCount = await prisma.case.count();
      const fileCount = await prisma.file.count();
      
      console.log('Users:', userCount);
      console.log('Cases:', caseCount);
      console.log('Files:', fileCount);
      
      if (fileCount > 0) {
          const sample = await prisma.file.findFirst();
          console.log('Sample File Path:', sample?.path);
      } else {
          console.log('Database seems empty.');
      }
  } catch(e) {
      console.error('DB Connection Failed:', e.message);
  } finally {
      await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); // Load environment variables

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for files stored locally...');
  try {
      const localFiles = await prisma.file.findMany({
        where: { path: { startsWith: '/' } },
        select: { id: true, path: true }
      });

      console.log('Found ' + localFiles.length + ' files stored locally.');
      if (localFiles.length > 0) {
          console.log('Sample paths:', localFiles.slice(0, 3).map(f => f.path));
      } else {
          console.log('All files are on Cloud!');
      }
  } catch(e) {
      console.error('Error:', e);
  } finally {
      await prisma.();
  }
}

main();

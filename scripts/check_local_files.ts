
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for files stored locally (paths starting with /)...');
  
  try {
      const localFiles = await prisma.file.findMany({
        where: {
          path: {
            startsWith: '/'
          }
        },
        select: {
          id: true,
          path: true
        }
      });

      console.log('Found ' + localFiles.length + ' files stored locally.');
      if (localFiles.length > 0) {
          console.log('Sample local paths:', localFiles.slice(0, 3).map(f => f.path));
      } else {
          console.log('All files seem to be on Cloud Storage (R2)!');
      }
  } catch(e) {
      console.error('DB Error:', e);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.();
  });

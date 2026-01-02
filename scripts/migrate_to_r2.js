const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 1. Manually Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });
}

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

async function main() {
  console.log(' Starting Local -> R2 Migration...');

  if (!R2_BUCKET_NAME || !R2_ACCOUNT_ID) {
      console.error(' Missing R2 Environment Variables!');
      console.log('Please ensure R2_BUCKET_NAME, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY are in .env');
      return;
  }

  // 2. Find Local Files
  const localFiles = await prisma.file.findMany({
    where: { path: { startsWith: '/' } }
  });

  console.log(` Found ${localFiles.length} files to migrate.`);

  for (const file of localFiles) {
    const localPath = path.join(__dirname, '../public', file.path);
    if (!fs.existsSync(localPath)) {
        console.warn(` File missing locally: ${localPath}`);
        continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const fileName = `${file.caseId}/${path.basename(file.path)}`; // Clean structure: caseId/filename
    const contentType = file.path.endsWith('.stl') ? 'model/stl' : 'application/octet-stream';

    console.log(` Uploading: ${fileName}...`);

    try {
        // 3. Upload to R2
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
        }));

        // 4. Update DB
        await prisma.file.update({
            where: { id: file.id },
            data: { path: fileName }
        });

        console.log(` Migrated: ${fileName}`);

    } catch (e) {
        console.error(` Failed to migrate ${fileName}:`, e);
    }
  }

  console.log(' Migration Complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

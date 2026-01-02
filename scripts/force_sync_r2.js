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
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
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
  console.log(' Starting Force Sync (Local Directory -> R2)...');

  if (!R2_BUCKET_NAME) {
      console.error(' Missing R2 Environment Variables!');
      return;
  }

  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) {
      console.log('No public/uploads directory found.');
      return;
  }

  const files = fs.readdirSync(uploadDir);
  console.log(` Found ${files.length} physical files in public/uploads.`);

  for (const fileName of files) {
    if (fileName.startsWith('.')) continue;

    const localPath = path.join(uploadDir, fileName);
    const fileBuffer = fs.readFileSync(localPath);
    // Simple key strategy: use the filename directly (flat structure for now to match DB)
    // If you want subfolders, logic needs to be smarter, but currently DB seems to use flat names.
    const r2Key = fileName; 
    const contentType = fileName.endsWith('.stl') ? 'model/stl' : 'application/octet-stream';

    console.log(` Uploading: ${fileName} -> R2...`);

    try {
        await r2Client.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: r2Key,
            Body: fileBuffer,
            ContentType: contentType,
        }));
        console.log(` Uploaded: ${fileName}`);
        
        // Optional: Ensure DB record uses this clean filename
        // This fixes cases where DB might have '/uploads/file.stl'
        const result = await prisma.file.updateMany({
            where: { path: { contains: fileName } },
            data: { path: fileName } 
        });
        
        if (result.count > 0) {
            console.log(`   Linked to ${result.count} DB records.`);
        } else {
             console.warn(`    No matching DB record found for ${fileName}`);
        }

    } catch (e) {
        console.error(` Failed:`, e.message);
    }
  }

  console.log(' Force Sync Complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

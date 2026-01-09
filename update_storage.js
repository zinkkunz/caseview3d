const fs = require('fs');
const path = require('path');

const storagePath = path.join(process.cwd(), 'lib/storage.ts');
let content = fs.readFileSync(storagePath, 'utf8');

const newFunction = `
export async function getPresignedUploadUrl(fileName: string, contentType: string, expiresIn = 600): Promise<{ url: string, key: string }> {
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return { url, key: fileName };
  } catch (error) {
    console.error('[R2] Presign Error:', error);
    throw error;
  }
}
`;

if (!content.includes('getPresignedUploadUrl')) {
    fs.writeFileSync(storagePath, content + newFunction, 'utf8');
    console.log('Added getPresignedUploadUrl to lib/storage.ts');
} else {
    console.log('getPresignedUploadUrl already exists');
}

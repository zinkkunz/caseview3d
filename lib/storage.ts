import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

export async function uploadFileToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return fileName;
}

export async function deleteFileFromR2(fileName: string): Promise<void> {
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
  });

  await r2Client.send(command);
}

export async function getSignedFileUrl(fileName: string, expiresIn = 3600): Promise<string> {
  console.log('[R2] Signing URL for:', fileName);
  console.log('[R2] Config:', { bucket: R2_BUCKET_NAME, accountId: R2_ACCOUNT_ID });
  
  if (!R2_BUCKET_NAME) {
      console.error('[R2] Error: R2_BUCKET_NAME is undefined');
      throw new Error('R2_BUCKET_NAME is not defined');
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
  });

  try {
      const url = await getSignedUrl(r2Client, command, { expiresIn });
      console.log('[R2] Generated URL:', url);
      return url;
  } catch (error) {
      console.error('[R2] Sign Error:', error);
      throw error;
  }
}

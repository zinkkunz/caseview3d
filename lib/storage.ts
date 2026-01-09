import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Lazy Load S3 Client
let r2ClientInstance: S3Client | null = null;

function getR2Client() {
  if (!r2ClientInstance) {
    const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID || 'MISSING_ENV'}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return r2ClientInstance;
}

export async function uploadFileToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await getR2Client().send(command);
  return fileName;
}

export async function deleteFileFromR2(fileName: string): Promise<void> {
  if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    });

  await getR2Client().send(command);
}

export async function getSignedFileUrl(fileName: string, expiresIn = 3600): Promise<string> {
  if (!process.env.R2_BUCKET_NAME) {
      console.error('[R2] Error: R2_BUCKET_NAME is undefined');
      throw new Error('R2_BUCKET_NAME is not defined');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });

  try {
      const url = await getSignedUrl(getR2Client(), command, { expiresIn });
      return url;
  } catch (error) {
      console.error('[R2] Sign Error:', error);
      throw error;
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getUserStorageStats(uploadsDir: string, users: any[]): any[] {
  return users.map(user => {
    let totalSize = 0;
    let caseCount = 0;
    
    if (user.Case) {
        caseCount = user.Case.length;
        user.Case.forEach((c: any) => {
            if (c.File) {
                c.File.forEach((f: any) => {
                    totalSize += f.size || 0;
                });
            }
        });
    }

    return {
      userId: user.id || 'unknown',
      userName: user.name || 'Unknown',
      userEmail: user.email || 'No Email',
      caseCount: caseCount,
      totalSize: totalSize
    };
  }).sort((a, b) => b.totalSize - a.totalSize);
}

export async function getPresignedUploadUrl(fileName: string, contentType: string, expiresIn = 600): Promise<{ url: string, key: string }> {
  if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined');

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(getR2Client(), command, { expiresIn });
    return { url, key: fileName };
  } catch (error) {
    console.error('[R2] Presign Error:', error);
    throw error;
  }
}

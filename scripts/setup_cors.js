const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const dotenv = require('dotenv');

// Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
};

const client = new S3Client(config);

async function main() {
    console.log('Setting CORS for bucket:', process.env.R2_BUCKET_NAME);
    
    if (!process.env.R2_BUCKET_NAME) {
        console.error('R2_BUCKET_NAME is missing');
        return;
    }

    const command = new PutBucketCorsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
                    AllowedOrigins: ['*'],
                    ExposeHeaders: ['ETag'],
                    MaxAgeSeconds: 3600
                }
            ]
        }
    });

    try {
        await client.send(command);
        console.log('Successfully set CORS!');
    } catch (err) {
        console.error('Error setting CORS:', err);
    }
}

main();

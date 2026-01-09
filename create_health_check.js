const fs = require('fs');
const path = require('path');

const content = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';

// Force dynamic to ensure real-time checks
export const dynamic = 'force-dynamic';

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        env: {},
        db: { status: 'pending' },
        r2: { status: 'pending' }
    };

    // 1. Env Check
    const requiredEnv = ['DATABASE_URL', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
    requiredEnv.forEach(key => {
        const val = process.env[key];
        report.env[key] = val ? (val.length > 5 ? 'OK (Set)' : 'WARNING (Too short)') : 'MISSING';
    });

    // 2. DB Check
    try {
        const start = Date.now();
        // Simple read check
        const userCount = await prisma.user.count();
        report.db = {
            status: 'OK',
            latency: \`\${Date.now() - start}ms\`,
            message: \`Connection successful. User count: \${userCount}\`
        };
    } catch (e: any) {
        report.db = {
            status: 'ERROR',
            error: e.message,
            code: e.code
        };
    }

    // 3. R2 Check
    try {
        const start = Date.now();
        const r2 = new S3Client({
            region: 'auto',
            endpoint: \`https://\${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com\`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
            },
        });
        
        const command = new ListObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            MaxKeys: 1
        });
        
        await r2.send(command);
        report.r2 = {
            status: 'OK',
            latency: \`\${Date.now() - start}ms\`,
            message: 'ListObjects connection successful'
        };
    } catch (e: any) {
        report.r2 = {
            status: 'ERROR',
            error: e.message,
            stack: e.stack
        };
    }

    return NextResponse.json(report, { status: 200 });
}
`;

const dirPath = path.join(process.cwd(), 'app', 'api', 'debug', 'health');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

const filePath = path.join(dirPath, 'route.ts');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully created health check route at ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}

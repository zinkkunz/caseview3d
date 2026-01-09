import 'dotenv/config';
import { uploadFileToR2, deleteFileFromR2 } from './lib/storage';

async function main() {
    const fileName = 'test-verification-file.txt';
    const content = Buffer.from('Hello R2 Verification');

    try {
        console.log(`Uploading ${fileName}...`);
        const result = await uploadFileToR2(content, fileName, 'text/plain');
        console.log(`Upload successful: ${result}`);

        console.log(`Cleaning up (Deleting ${fileName})...`);
        await deleteFileFromR2(fileName);
        console.log('Cleanup successful');

        console.log('R2 verification SUCCESS');
    } catch (error) {
        console.error('R2 verification FAILED:', error);
        process.exit(1);
    }
}

main();

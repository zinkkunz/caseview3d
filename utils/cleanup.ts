
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Scans the specified directory and deletes files older than maxAgeHours.
 * @param directoryPath Absolute path to the directory to clean
 * @param maxAgeHours Retention period in hours (default: 48)
 */
export async function cleanupOldFiles(directoryPath: string, maxAgeHours: number = 48) {
    try {
        const now = Date.now();
        const limit = maxAgeHours * 60 * 60 * 1000;

        // Check if directory exists
        try {
            await fs.access(directoryPath);
        } catch {
            return; // Directory doesn't exist, nothing to clean
        }

        const files = await fs.readdir(directoryPath);

        const deletePromises = files.map(async (file) => {
            const filePath = path.join(directoryPath, file);
            try {
                const stats = await fs.stat(filePath);
                if (stats.isFile()) {
                    const age = now - stats.mtimeMs;
                    if (age > limit) {
                        await fs.unlink(filePath);
                        console.log(`[Cleanup] Deleted old file: ${file}`);
                    }
                }
            } catch (err) {
                console.error(`[Cleanup] Failed to process ${file}:`, err);
            }
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('[Cleanup] Error during cleanup:', error);
    }
}

import fs from 'fs';
import path from 'path';

export function getDirectorySize(dirPath: string): number {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    return totalSize;
  } catch (error) {
    console.warn('Error calculating directory size:', error);
    return 0;
  }
}

export function getLargeFiles(dirPath: string, limit: number = 10): any[] {
    let allFiles: { fileName: string, size: number, filePath: string }[] = [];
    
    function traverse(currentPath: string) {
        if (!fs.existsSync(currentPath)) return;
        
        const files = fs.readdirSync(currentPath);
        
        for (const file of files) {
            const filePath = path.join(currentPath, file);
            try {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    traverse(filePath);
                } else {
                    allFiles.push({
                        fileName: file,
                        size: stats.size,
                        filePath: filePath.replace(dirPath, '') // Relative path
                    });
                }
            } catch (e) {
                // Ignore access errors
            }
        }
    }
    
    try {
        traverse(dirPath);
    } catch (e) {
        console.error("Error scanning files", e);
    }

    return allFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, limit);
}

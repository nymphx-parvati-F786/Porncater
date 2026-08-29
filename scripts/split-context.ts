import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd();

// Output files
const PAGES_OUT = path.join(rootDir, 'context-pages.txt');
const API_OUT = path.join(rootDir, 'context-api.txt');
const SRC_OUT = path.join(rootDir, 'context-src.txt');

// Helper to recursively get all files
function walkDir(dir: string, fileList: string[] = []): string[] {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    // Skip heavy or irrelevant folders
    if (['node_modules', '.next', '.git', 'public', 'assets', 'banners'].includes(item.name)) continue;
    
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = walkDir(rootDir);

const pagesFiles: string[] = [];
const apiFiles: string[] = [];
const srcFiles: string[] = [];

allFiles.forEach(file => {
  // Normalize path to use forward slashes for checking, regardless of OS
  const relativePath = path.relative(rootDir, file).replace(/\\/g, '/'); 

  // 1. Pages & Layouts (app folder, but NOT app/api)
  if (relativePath.startsWith('app/') && !relativePath.startsWith('app/api/')) {
    const baseName = path.basename(relativePath);
    if (['page.tsx', 'layout.tsx', 'loading.tsx', 'not-found.tsx'].includes(baseName)) {
      pagesFiles.push(file);
    }
  }
  // 2. API Routes & Prisma
  else if (relativePath.startsWith('app/api/') && relativePath.endsWith('route.ts')) {
    apiFiles.push(file);
  } else if (relativePath === 'prisma/schema.prisma') {
    apiFiles.push(file);
  }
  // 3. SRC Components & Utils
  else if (relativePath.startsWith('src/')) {
    const ext = path.extname(relativePath);
    if (['.ts', '.tsx', '.css'].includes(ext)) {
      srcFiles.push(file);
    }
  }
});

// Write array of files to a specific text file
function writeContextFile(outputPath: string, files: string[]) {
  if (files.length === 0) return;
  
  let content = '';
  files.forEach(file => {
    // Keep the native Windows path formatting you requested (e.g., app\page.tsx)
    const nativeRelativePath = path.relative(rootDir, file);
    
    content += `${nativeRelativePath} -:\n`;
    content += fs.readFileSync(file, 'utf-8') + '\n\n';
    content += '='.repeat(80) + '\n\n';
  });
  
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated: ${path.basename(outputPath)} (${files.length} files)`);
}

writeContextFile(PAGES_OUT, pagesFiles);
writeContextFile(API_OUT, apiFiles);
writeContextFile(SRC_OUT, srcFiles);
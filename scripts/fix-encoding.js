import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../dist/assets/content.js');

try {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        // Write back as UTF-8 with BOM
        const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
        const contentWithBom = Buffer.concat([bom, content]);
        fs.writeFileSync(filePath, contentWithBom);
        console.log(`Successfully rewrote ${filePath} as UTF-8 with BOM`);
    } else {
        console.error(`File not found: ${filePath}`);
    }
} catch (err) {
    console.error('Error fixing encoding:', err);
    process.exit(1);
}

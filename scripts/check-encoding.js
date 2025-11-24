import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../dist/assets/content.js');

try {
    const buffer = fs.readFileSync(filePath);

    // Check for null bytes
    let nullByteCount = 0;
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0) {
            nullByteCount++;
        }
    }

    if (nullByteCount > 0) {
        console.error(`Found ${nullByteCount} null bytes in the file! This is likely the cause.`);
    } else {
        console.log("No null bytes found.");
    }

    try {
        new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        console.log("File is VALID UTF-8.");
    } catch (e) {
        console.error("File is INVALID UTF-8.");
        console.error(e.message);
    }

} catch (err) {
    console.error('Error reading file:', err);
}

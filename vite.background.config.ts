import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/background/index.ts'),
            name: 'LeetBotBackground',
            formats: ['iife'],
            fileName: () => 'assets/background.js',
        },
        rollupOptions: {
            output: {
                entryFileNames: 'assets/background.js',
                extend: true,
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    }
})

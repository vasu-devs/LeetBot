import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [react()],
    build: {
        emptyOutDir: false, // Don't delete popup build
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/content/index.tsx'),
            name: 'LeetBotContent',
            formats: ['iife'],
            fileName: () => 'assets/content.js',
        },
        rollupOptions: {
            output: {
                // Ensure CSS is emitted with a predictable name if possible, 
                // but Vite lib mode usually emits style.css. We might need to rename it.
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'assets/content.css';
                    return `assets/[name].[ext]`;
                },
            },
        },
    },
    esbuild: {
        charset: 'ascii',
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    }
})
